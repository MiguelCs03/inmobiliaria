from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import (ClientSerializer, SegmentInputSerializer,
                           SegmentOutputSerializer)
from .clustering_service import clustering_service
from .tasks import segment_client_async

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.prefetch_related('recommendations').all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['segmento_id','tipo_prop_pref','zona_pref']

    @action(detail=False, methods=['post'], url_path='segmentar')
    def segmentar(self, request):
        """POST /api/v1/clients/segmentar/ — inmediato, sin guardar."""
        ser = SegmentInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        result = clustering_service.segment_client(ser.validated_data)
        return Response(SegmentOutputSerializer(result).data)

    @action(detail=True, methods=['post'], url_path='segmentar-y-guardar')
    def segmentar_y_guardar(self, request, pk=None):
        """POST /api/v1/clients/{id}/segmentar-y-guardar/ — async Celery."""
        client = self.get_object()
        segment_client_async.delay(client.id)
        return Response({'status': 'en_proceso', 'client_id': client.id},
                        status=status.HTTP_202_ACCEPTED)
