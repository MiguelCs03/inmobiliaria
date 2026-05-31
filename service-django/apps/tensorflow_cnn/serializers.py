from rest_framework import serializers

class ImagePredictSerializer(serializers.Serializer):
    imagen = serializers.ImageField()

class PredictionOutputSerializer(serializers.Serializer):
    ambiente = serializers.DictField()
    conservacion = serializers.DictField()
    modo = serializers.CharField()
