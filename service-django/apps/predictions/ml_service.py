# apps/predictions/ml_service.py
import joblib
import torch
from django.conf import settings
from pathlib import Path

class ModelService:
    _instance = None
    _model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self, model_name: str):
        model_path = settings.ML_MODELS_DIR / model_name
        if model_path.suffix == '.pkl':
            self._model = joblib.load(model_path)
        elif model_path.suffix == '.pt':
            self._model = torch.load(model_path, map_location='cpu')
            self._model.eval()
        return self

    def predict(self, input_data):
        import numpy as np
        arr = np.array(input_data).reshape(1, -1)
        return self._model.predict(arr).tolist()

# Instancia global (se carga una sola vez al iniciar Django)
ml_service = ModelService.get_instance().load_model('modelo_v1.pkl')