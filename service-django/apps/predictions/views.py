from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import PredictionInputSerializer
from .ml_service import ml_service

class PredictView(APIView):
    def post(self, request):
        serializer = PredictionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = ml_service.predict(serializer.validated_data['features'])
        return Response({'prediction': result[0]})