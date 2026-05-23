from rest_framework import serializers
from .models import PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PropertyImage
        fields = ['id','propiedad_id','image','status','conservation_state',
                  'room_type','confidence_conservation','confidence_room',
                  'full_result','error','uploaded_by','created_at','analyzed_at']
        read_only_fields = ['status','conservation_state','room_type',
                            'confidence_conservation','confidence_room',
                            'full_result','error','analyzed_at']

class ImageUploadSerializer(serializers.Serializer):
    image       = serializers.ImageField()
    propiedad_id = serializers.IntegerField()
