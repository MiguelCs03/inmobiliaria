from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ValuationInputSerializer, ValuationOutputSerializer
from .random_forest_service import rf_service
from .models import ValuationJob
from .tasks import predict_price_async

class ValuationView(APIView):
    """POST /api/v1/valuations/predict/ — respuesta inmediata."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ValuationInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        result = rf_service.predict_price(ser.validated_data)
        return Response(result, status=status.HTTP_200_OK)

class ValuationAsyncView(APIView):
    """POST /api/v1/valuations/predict-async/ — tarea Celery."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ValuationInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        job = ValuationJob.objects.create(
            propiedad_id=ser.validated_data.get('propiedad_id'),
            input_data=ser.validated_data,
            status='pending',
        )
        predict_price_async.delay(job.id)
        return Response({'job_id': job.id, 'status': 'pending'}, status=status.HTTP_202_ACCEPTED)

class ValuationJobStatusView(APIView):
    """GET /api/v1/valuations/job/<id>/ — consulta resultado."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            job = ValuationJob.objects.get(pk=pk)
        except ValuationJob.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ValuationOutputSerializer(job).data)
