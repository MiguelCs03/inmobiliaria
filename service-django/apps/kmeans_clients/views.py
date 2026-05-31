from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import (ClientSerializer, SegmentInputSerializer,
                           SegmentOutputSerializer)
from .clustering_service import clustering_service

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.prefetch_related('recommendations').all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['segmento_id','tipo_prop_pref','zona_pref']

    @action(detail=False, methods=['post'], url_path='segmentar')
    def segmentar(self, request):
        ser = SegmentInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        result = clustering_service.segment_client(ser.validated_data)
        return Response(SegmentOutputSerializer(result).data)
