from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import PropertyImage
from .serializers import PropertyImageSerializer, ImageUploadSerializer
from .upload_handler import handle_property_image_upload
from .tasks import analyze_image_async

class ImageUploadView(APIView):
    """POST /api/v1/images/upload/ — sube imagen y lanza análisis CNN."""
    parser_classes    = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ImageUploadSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            file = handle_property_image_upload(request, ser.validated_data['propiedad_id'])
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        img_obj = PropertyImage.objects.create(
            propiedad_id=ser.validated_data['propiedad_id'],
            image=file,
            uploaded_by=request.user.id if request.user.is_authenticated else None,
        )
        analyze_image_async.delay(img_obj.id)
        return Response(
            {'image_id': img_obj.id, 'status': 'pending',
             'message': 'Imagen recibida. Análisis en progreso.'},
            status=status.HTTP_202_ACCEPTED
        )

class ImageResultView(APIView):
    """GET /api/v1/images/result/<image_id>/ — consulta resultado."""
    permission_classes = [IsAuthenticated]

    def get(self, request, image_id):
        try:
            img_obj = PropertyImage.objects.get(id=image_id)
        except PropertyImage.DoesNotExist:
            return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PropertyImageSerializer(img_obj).data)

class PropertyImagesView(APIView):
    """GET /api/v1/images/property/<property_id>/ — todas las imágenes de una propiedad."""
    permission_classes = [IsAuthenticated]

    def get(self, request, property_id):
        images = PropertyImage.objects.filter(propiedad_id=property_id)
        return Response(PropertyImageSerializer(images, many=True).data)
