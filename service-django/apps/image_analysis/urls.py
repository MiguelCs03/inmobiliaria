from django.urls import path
from .views import ImageUploadView, ImageResultView, PropertyImagesView

urlpatterns = [
    path('upload/',                     ImageUploadView.as_view(),    name='image-upload'),
    path('result/<int:image_id>/',      ImageResultView.as_view(),    name='image-result'),
    path('property/<int:property_id>/', PropertyImagesView.as_view(), name='property-images'),
]
