from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ValuationInputSerializer
from .random_forest_service import rf_service
from .kpi_service import valuations_kpi_service


class ValuationView(APIView):
    def post(self, request):
        ser = ValuationInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        result = rf_service.predict_price(ser.validated_data)
        return Response(result, status=status.HTTP_200_OK)


class ValuationsKPIView(APIView):
    def get(self, request):
        result = valuations_kpi_service.get_kpi(
            zona=request.query_params.get('zona'),
            tipo_propiedad=request.query_params.get('tipo_propiedad'),
        )
        return Response(result, status=status.HTTP_200_OK)
