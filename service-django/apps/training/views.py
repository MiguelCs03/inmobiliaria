from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

class TrainingStatusView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.conf import settings
        from pathlib import Path
        base = Path(settings.ML_MODELS_DIR)
        models = {
            'random_forest': (base / 'random_forest/models/random_forest_v1.pkl').exists(),
            'kmeans':        (base / 'kmeans/models/kmeans_clients_v1.pkl').exists(),
            'tensorflow':    (base / 'tensorflow/models/cnn_scratch_v1.h5').exists(),
        }
        return Response({'modelos': models,
                         'directorio': str(base)})
