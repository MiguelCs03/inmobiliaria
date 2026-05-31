from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client
from .serializers import (ClientSerializer, SegmentInputSerializer,
                           SegmentOutputSerializer)
from .clustering_service import clustering_service
from .kpi_service import clients_kpi_service


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.prefetch_related('recommendations').all()
    serializer_class = ClientSerializer
    filterset_fields = ['segmento_id', 'tipo_prop_pref', 'zona_pref']

    @action(detail=False, methods=['post'], url_path='segmentar')
    def segmentar(self, request):
        ser = SegmentInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        result = clustering_service.segment_client(ser.validated_data)
        return Response(SegmentOutputSerializer(result).data)

    @action(detail=False, methods=['get'], url_path='kpi')
    def kpi(self, request):
        zona = request.query_params.get('zona_pref')
        tipo = request.query_params.get('tipo_prop_pref')
        seg = request.query_params.get('segmento_id')
        seg_int = int(seg) if seg and seg.isdigit() else None
        result = clients_kpi_service.get_kpi(
            zona_pref=zona, tipo_prop_pref=tipo, segmento_id=seg_int,
        )
        return Response(result)
