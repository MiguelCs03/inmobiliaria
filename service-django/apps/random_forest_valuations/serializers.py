from rest_framework import serializers

class ValuationInputSerializer(serializers.Serializer):
    propiedad_id   = serializers.IntegerField(required=False)
    metros_cuad    = serializers.FloatField()
    habitaciones   = serializers.IntegerField()
    banos          = serializers.IntegerField()
    anio_construc  = serializers.IntegerField()
    barrio         = serializers.CharField(max_length=100)
    ciudad         = serializers.CharField(max_length=100, default='Santa Cruz')
    anillo_vial    = serializers.IntegerField(required=False, default=3)
    tipo_propiedad = serializers.CharField(max_length=50, required=False)
    tipo_operacion = serializers.CharField(max_length=50, required=False)
