"""
Singleton — CNN PyTorch para análisis de imágenes de propiedades.
Arquitectura: ResNet18 con dos cabezas de clasificación.
  - head_conservation: 5 clases (Excelente, Bueno, Regular, Deteriorado, Ruinoso)
  - head_rooms:        8 clases (Sala, Cocina, Dormitorio, Baño, Exterior, Garaje, Terraza, Otro)
"""
import logging
import numpy as np
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

CONSERVATION_LABELS = ['Excelente','Bueno','Regular','Malo','En construcción']
ROOM_LABELS         = ['Sala','Dormitorio','Cocina','Baño','Fachada exterior','Jardín/Patio','Garaje','Otro']

class PropertyDualHeadCNN:
    """Arquitectura ResNet18 con dos cabezas."""
    def __new__(cls, num_conservation=5, num_rooms=8):
        try:
            import torch
            import torch.nn as nn
            from torchvision import models as tv_models

            instance = object.__new__(cls)
            backbone = tv_models.resnet18(weights=None)
            in_features = backbone.fc.in_features
            backbone.fc = nn.Identity()
            instance.backbone          = backbone
            instance.head_conservation = nn.Linear(in_features, num_conservation)
            instance.head_rooms        = nn.Linear(in_features, num_rooms)
            return instance
        except ImportError:
            return None

class PropertyCNNService:
    _instance = None
    _model    = None
    _ready    = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _get_transform(self):
        from torchvision import transforms
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
        ])

    def _load_model(self):
        model_path = Path(settings.ML_MODELS_DIR) / 'cnn_property.pt'
        if not model_path.exists():
            logger.warning("cnn_property.pt no encontrado. CNN en modo degradado.")
            return
        try:
            import torch
            model = PropertyDualHeadCNN()
            if model is None:
                logger.warning("PyTorch no disponible.")
                return
            state = torch.load(str(model_path), map_location='cpu')
            model.backbone.load_state_dict(state.get('backbone', {}), strict=False)
            model.head_conservation.load_state_dict(state.get('head_conservation', {}), strict=False)
            model.head_rooms.load_state_dict(state.get('head_rooms', {}), strict=False)
            model.backbone.eval()
            model.head_conservation.eval()
            model.head_rooms.eval()
            self._model = model
            self._ready = True
            logger.info("CNN cargada correctamente.")
        except Exception as e:
            logger.error(f"Error cargando CNN: {e}")

    def is_ready(self) -> bool:
        return self._ready

    def analyze(self, image_path: str) -> dict:
        if not self._ready:
            return self._fallback(image_path)
        try:
            import torch
            import torch.nn.functional as F
            from PIL import Image

            transform = self._get_transform()
            img = Image.open(image_path).convert('RGB')
            x   = transform(img).unsqueeze(0)

            with torch.no_grad():
                feats        = self._model.backbone(x)
                logits_cons  = self._model.head_conservation(feats)
                logits_room  = self._model.head_rooms(feats)

                probs_cons = F.softmax(logits_cons, dim=1).squeeze().numpy()
                probs_room = F.softmax(logits_room,  dim=1).squeeze().numpy()

            idx_cons = int(np.argmax(probs_cons))
            idx_room = int(np.argmax(probs_room))

            return {
                'estado_conservacion':       CONSERVATION_LABELS[idx_cons],
                'confianza_conservacion':    round(float(probs_cons[idx_cons]), 4),
                'tipo_ambiente':             ROOM_LABELS[idx_room],
                'confianza_ambiente':        round(float(probs_room[idx_room]), 4),
                'distribucion_conservacion': {
                    CONSERVATION_LABELS[i]: round(float(p),4)
                    for i,p in enumerate(probs_cons)},
                'distribucion_ambiente': {
                    ROOM_LABELS[i]: round(float(p),4)
                    for i,p in enumerate(probs_room)},
                'modo': 'modelo',
            }
        except Exception as e:
            logger.error(f"Error en CNN.analyze: {e}")
            return self._fallback(image_path)

    def _fallback(self, image_path: str) -> dict:
        """Retorna placeholder cuando el modelo no está listo."""
        return {
            'estado_conservacion':       'Bueno',
            'confianza_conservacion':    0.0,
            'tipo_ambiente':             'Sala',
            'confianza_ambiente':        0.0,
            'distribucion_conservacion': {k:0.2 for k in CONSERVATION_LABELS},
            'distribucion_ambiente':     {k:0.125 for k in ROOM_LABELS},
            'modo': 'fallback_sin_modelo',
        }

cnn_service = PropertyCNNService()
