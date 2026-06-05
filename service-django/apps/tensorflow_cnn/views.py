import tempfile, os, requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ImagePredictSerializer, ImageUrlSerializer, PredictionOutputSerializer
from .tf_service import cnn_service

class PredictView(APIView):
    def post(self, request):
        serializer = ImagePredictSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        image = serializer.validated_data['imagen']
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            for chunk in image.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        try:
            result = cnn_service.predict(tmp_path)
            out_serializer = PredictionOutputSerializer(data=result)
            out_serializer.is_valid()
            return Response(out_serializer.data, status=status.HTTP_200_OK)
        finally:
            os.unlink(tmp_path)

class PredictUrlView(APIView):
    def post(self, request):
        serializer = ImageUrlSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        url = serializer.validated_data['url']
        tmp_path = None
        try:
            resp = requests.get(url, stream=True, timeout=30)
            resp.raise_for_status()
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                for chunk in resp.iter_content(chunk_size=8192):
                    tmp.write(chunk)
                tmp_path = tmp.name
            result = cnn_service.predict(tmp_path)
            out_serializer = PredictionOutputSerializer(data=result)
            out_serializer.is_valid()
            return Response(out_serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
