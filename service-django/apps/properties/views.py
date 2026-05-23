from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from .models import Propiedad
from .serializers import PropiedadSerializer

class PropiedadViewSet(mixins.ListModelMixin,
                       mixins.RetrieveModelMixin,
                       viewsets.GenericViewSet):
    queryset = Propiedad.objects.select_related(
        'tipo_propiedad','tipo_operacion','estado_propiedad').all()
    serializer_class = PropiedadSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tipo_propiedad','tipo_operacion','estado_propiedad']
