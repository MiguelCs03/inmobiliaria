import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADING_LIMIT"] = "1"
os.environ["TF_NUM_INTRAOP_THREADING_LIMIT"] = "1"

import logging
from pathlib import Path
from django.conf import settings
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite

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
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        self.model_path = Path(settings.ML_MODELS_DIR) / 'tensorflow/models/cnn_scratch_v1.tflite'
        self._load()

    def _load(self):
        if not self.model_path.exists():
            logger.warning(f'Modelo TFLite no encontrado en {self.model_path}')
            return
        try:
            self.interpreter = tflite.Interpreter(model_path=str(self.model_path), num_threads=1)
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            logger.info(f'Modelo TFLite CNN cargado desde {self.model_path}')
            self._warmup()
        except Exception as e:
            logger.error(f'Error cargando modelo TFLite: {e}')

    def _warmup(self):
        if self.interpreter is None:
            return
        dummy = np.random.rand(1, *IMG_SIZE, 3).astype(np.float32)
        try:
            self.interpreter.set_tensor(self.input_details[0]['index'], dummy)
            self.interpreter.invoke()
            _ = self.interpreter.get_tensor(self.output_details[0]['index'])
            logger.info('Warm-up completado (predicción dummy ejecutada)')
        except Exception as e:
            logger.warning(f'Warm-up falló (no crítico): {e}')

    def predict(self, image_path):
        if self.interpreter is None:
            return {
                'ambiente': None,
                'conservacion': None,
                'modo': 'fallback_sin_modelo',
            }
        try:
            img = Image.open(image_path).convert('RGB').resize(IMG_SIZE)
            arr = np.array(img, dtype=np.float32)
            arr = np.expand_dims(arr, axis=0)

            self.interpreter.set_tensor(self.input_details[0]['index'], arr)
            self.interpreter.invoke()

            preds_0 = self.interpreter.get_tensor(self.output_details[0]['index'])
            preds_1 = self.interpreter.get_tensor(self.output_details[1]['index'])

            if preds_0.shape[1] == 12:
                room_probs = preds_0[0]
                conserv_probs = preds_1[0]
            else:
                room_probs = preds_1[0]
                conserv_probs = preds_0[0]

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
        except Exception as e:
            logger.error(f'Error en predicción CNN TFLite: {e}')
            return {
                'ambiente': None,
                'conservacion': None,
                'modo': 'fallback_sin_modelo',
            }

cnn_service = CNNScratchService()
