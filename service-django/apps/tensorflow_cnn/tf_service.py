import os, logging
from pathlib import Path
from django.conf import settings
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

logger = logging.getLogger(__name__)

ROOM_LABELS = [
    'Sala', 'Cocina', 'Dormitorio_principal', 'Dormitorio_secundario',
    'Bano', 'Fachada_exterior', 'Jardin', 'Garage', 'Terraza',
    'Comedor', 'Pasillo', 'Lavanderia',
]
CONSERV_LABELS = ['Excelente', 'Bueno', 'Regular']
IMG_SIZE = (224, 224)

class CNNScratchService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.model = None
        self.model_path = Path(settings.ML_MODELS_DIR) / 'tensorflow/models/cnn_scratch_v1.h5'
        self._load()

    def _load(self):
        if not self.model_path.exists():
            logger.warning(f'Modelo no encontrado en {self.model_path}')
            return
        try:
            self.model = load_model(str(self.model_path))
            logger.info(f'Modelo CNN cargado desde {self.model_path}')
        except Exception as e:
            logger.error(f'Error cargando modelo: {e}')

    def predict(self, image_path):
        if self.model is None:
            return {
                'ambiente': None,
                'conservacion': None,
                'modo': 'fallback_sin_modelo',
            }
        img = load_img(image_path, target_size=IMG_SIZE)
        arr = img_to_array(img)
        arr = np.expand_dims(arr, axis=0)
        preds = self.model.predict(arr, verbose=0)
        room_probs = preds[0][0]
        conserv_probs = preds[1][0]
        room_idx = np.argmax(room_probs)
        conserv_idx = np.argmax(conserv_probs)
        return {
            'ambiente': {
                'clase': ROOM_LABELS[room_idx],
                'confianza': float(room_probs[room_idx]),
                'probabilidades': dict(zip(ROOM_LABELS, [float(p) for p in room_probs])),
            },
            'conservacion': {
                'clase': CONSERV_LABELS[conserv_idx],
                'confianza': float(conserv_probs[conserv_idx]),
                'probabilidades': dict(zip(CONSERV_LABELS, [float(p) for p in conserv_probs])),
            },
            'modo': 'cnn_scratch',
        }

cnn_service = CNNScratchService()
