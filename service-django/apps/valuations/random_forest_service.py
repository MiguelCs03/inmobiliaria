"""
Singleton — Random Forest para estimación de precio de propiedades.
Si el modelo no existe aún, opera en modo degradado con reglas básicas.
"""
import logging
import numpy as np
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

class RandomForestPriceService:
    _instance = None
    _model = None
    _le_zona = None
    _features = None
    _ready = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        model_path = Path(settings.ML_MODELS_DIR) / 'random_forest_v1.pkl'
        if model_path.exists():
            try:
                import joblib
                bundle = joblib.load(model_path)
                self._model = bundle['model']
                self._le_zona = bundle['le_zona']
                self._features = bundle['features']
                self._ready = True
                logger.info("RandomForest cargado correctamente.")
            except Exception as e:
                logger.warning(f"No se pudo cargar RandomForest: {e}")
        else:
            logger.warning("random_forest_v1.pkl no encontrado. Modo degradado activo.")

    def is_ready(self) -> bool:
        return self._ready

    def _build_features(self, data: dict) -> np.ndarray:
        barrio = data.get('barrio', '')
        try:
            zona_enc = self._le_zona.transform([barrio.lower().strip()])[0]
        except (ValueError, AttributeError):
            zona_enc = 0
        return np.array([[
            float(data.get('metros_cuad', 100)),
            int(data.get('habitaciones', 3)),
            int(data.get('banos', 2)),
            int(data.get('anio_construc', 2010)),
            zona_enc,
            int(data.get('anillo_vial', 3)),
        ]])

    def predict_price(self, data: dict) -> dict:
        if not self._ready:
            return self._fallback(data)
        try:
            X = self._build_features(data)
            estimators = self._model.estimators_
            preds = np.array([t.predict(X)[0] for t in estimators])
            return {
                'precio_estimado': round(float(np.median(preds)), 2),
                'rango_min':       round(float(np.percentile(preds, 5)), 2),
                'rango_max':       round(float(np.percentile(preds, 95)), 2),
                'modo': 'modelo',
            }
        except Exception as e:
            logger.error(f"Error en predict_price: {e}")
            return self._fallback(data)

    def _fallback(self, data: dict) -> dict:
        """Estimación básica por m2 según zona cuando no hay modelo entrenado."""
        m2    = float(data.get('metros_cuad', 100))
        barrio = data.get('barrio', '').lower()
        pm2_map = {
            'equipetrol': 900, 'urbari': 750, 'las palmas': 650,
            'hamacas': 600,    'banzer': 500, 'sirari': 480,
            'plan 3000': 200,  'villa': 180,  'cotoca': 150,
        }
        pm2 = 350  # default medio
        for key, val in pm2_map.items():
            if key in barrio:
                pm2 = val
                break
        est = round(m2 * pm2, 2)
        return {
            'precio_estimado': est,
            'rango_min':       round(est * 0.85, 2),
            'rango_max':       round(est * 1.15, 2),
            'modo': 'fallback_reglas',
        }

rf_service = RandomForestPriceService()
