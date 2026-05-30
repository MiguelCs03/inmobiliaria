from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/valuations/',  include('apps.random_forest_valuations.urls')),
    path('api/v1/clients/',     include('apps.kmeans_clients.urls')),
    path('api/v1/tf/',          include('apps.tf_cnn.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
