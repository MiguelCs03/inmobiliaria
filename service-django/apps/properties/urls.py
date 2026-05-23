from rest_framework.routers import DefaultRouter
from .views import PropiedadViewSet
router = DefaultRouter()
router.register(r'', PropiedadViewSet, basename='propiedad')
urlpatterns = router.urls
