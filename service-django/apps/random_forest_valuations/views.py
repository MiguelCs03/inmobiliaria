from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ValuationInputSerializer
from .random_forest_service import rf_service

class ValuationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ValuationInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        result = rf_service.predict_price(ser.validated_data)
        return Response(result, status=status.HTTP_200_OK)
