import tempfile, os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ImagePredictSerializer, PredictionOutputSerializer
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
