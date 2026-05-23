from rest_framework import serializers
from .models import ValuationJob

class ValuationInputSerializer(serializers.Serializer):
    propiedad_id   = serializers.IntegerField(required=False)
    metros_cuad    = serializers.FloatField()
    habitaciones   = serializers.IntegerField()
    banos          = serializers.IntegerField()
    anio_construc  = serializers.IntegerField()
    barrio         = serializers.CharField(max_length=100)
    ciudad         = serializers.CharField(max_length=100, default='Santa Cruz')
    tipo_propiedad = serializers.CharField(max_length=50, required=False)
    tipo_operacion = serializers.CharField(max_length=50, required=False)

class ValuationOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ValuationJob
        fields = ['id','propiedad_id','precio_estimado','rango_min','rango_max',
                  'status','created_at']
