# apps/predictions/serializers.py
from rest_framework import serializers

class PredictionInputSerializer(serializers.Serializer):
    features = serializers.ListField(child=serializers.FloatField())

class PredictionOutputSerializer(serializers.Serializer):
    prediction = serializers.FloatField()
    confidence = serializers.FloatField(required=False)