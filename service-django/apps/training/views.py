from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

class TrainingStatusView(APIView):
    """GET /api/v1/training/status/ — estado de modelos entrenados."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.conf import settings
        from pathlib import Path
        trained = Path(settings.ML_MODELS_DIR)
        models = {
            'random_forest_v1.pkl':  (trained / 'random_forest_v1.pkl').exists(),
            'kmeans_clients_v1.pkl': (trained / 'kmeans_clients_v1.pkl').exists(),
            'cnn_property.pt':       (trained / 'cnn_property.pt').exists(),
        }
        return Response({'modelos': models,
                         'directorio': str(trained)})
