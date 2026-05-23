from rest_framework import serializers
from .models import Propiedad, TipoPropiedad, TipoOperacion

class PropiedadSerializer(serializers.ModelSerializer):
    tipo_propiedad_nombre  = serializers.CharField(source='tipo_propiedad.nombre', read_only=True)
    tipo_operacion_nombre  = serializers.CharField(source='tipo_operacion.nombre', read_only=True)
    estado_nombre          = serializers.CharField(source='estado_propiedad.nombre', read_only=True)

    class Meta:
        model  = Propiedad
        fields = ['id','precio_base','area_m2','ubicacion','detalles_json',
                  'tipo_propiedad_nombre','tipo_operacion_nombre','estado_nombre']
