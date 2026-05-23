from rest_framework import serializers
from .models import Client, ClientRecommendation

class ClientRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ClientRecommendation
        fields = ['id','titulo','descripcion','propiedad_id','score','created_at']

class ClientSerializer(serializers.ModelSerializer):
    recommendations = ClientRecommendationSerializer(many=True, read_only=True)
    class Meta:
        model  = Client
        fields = ['id','usuario_id','nombres','email','telefono','presupuesto_max',
                  'tipo_prop_pref','habitaciones_pref','zona_pref','n_busquedas',
                  'interacciones','segmento_id','segmento_nombre',
                  'created_at','updated_at','recommendations']
        read_only_fields = ['segmento_id','segmento_nombre','created_at','updated_at']

class SegmentInputSerializer(serializers.Serializer):
    presupuesto_max   = serializers.FloatField()
    tipo_prop_pref    = serializers.CharField(max_length=50, required=False, default='Departamento')
    habitaciones_pref = serializers.IntegerField(required=False, default=2)
    zona_pref         = serializers.CharField(max_length=100, required=False, default='')
    n_busquedas       = serializers.IntegerField(required=False, default=0)
    interacciones     = serializers.IntegerField(required=False, default=0)

class SegmentOutputSerializer(serializers.Serializer):
    segmento_id     = serializers.IntegerField()
    segmento_nombre = serializers.CharField()
    descripcion     = serializers.CharField()
    recomendaciones = serializers.ListField(child=serializers.CharField())
    modo            = serializers.CharField()
