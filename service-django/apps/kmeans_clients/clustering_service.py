"""
Singleton — K-Means para segmentación de clientes.
5 segmentos: Comprador premium, Arrendatario joven, Inversor patrimonial,
             Familia en crecimiento, Profesional soltero.
"""
import logging
import numpy as np
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

SEGMENTOS = {
    0: {"nombre": "Comprador premium",       "desc": "Alto presupuesto, busca propiedades exclusivas"},
    1: {"nombre": "Arrendatario joven",      "desc": "Presupuesto limitado, prefiere alquiler céntrico"},
    2: {"nombre": "Inversor patrimonial",    "desc": "Compra para invertir o rentar"},
    3: {"nombre": "Familia en crecimiento",  "desc": "Busca espacio y seguridad, zona residencial"},
    4: {"nombre": "Profesional soltero",     "desc": "Departamento moderno bien ubicado"},
}

TIPO_PROP_MAP = {
    'casa': 0, 'departamento': 1, 'terreno': 2,
    'oficina': 3, 'local comercial': 4, 'duplex': 5, 'penthouse': 6,
}
ZONA_MAP = {
    'equipetrol norte': 0, 'equipetrol sur': 1, 'urbari': 2,
    'las palmas': 3, 'hamacas': 4, 'casco viejo': 5,
    'plan 3000': 6, 'villa 1ro de mayo': 7, 'av. banzer': 8,
    'sirari': 9, 'norte': 10, 'sur': 11,
}

class ClientClusteringService:
    _instance = None
    _model = None
    _scaler = None
    _le_tipo = None
    _le_zona = None
    _ready = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        model_path = Path(settings.ML_MODELS_DIR) / 'kmeans/models/kmeans_clients_v1.pkl'
        if model_path.exists():
            try:
                import joblib
                bundle = joblib.load(model_path)
                self._model = bundle['kmeans']
                self._scaler = bundle['scaler']
                self._le_tipo = bundle['le_tipo']
                self._le_zona = bundle['le_zona']
                self._ready = True
                logger.info("KMeans cargado correctamente.")
            except Exception as e:
                logger.warning(f"No se pudo cargar KMeans: {e}")
        else:
            logger.warning("kmeans_clients_v1.pkl no encontrado. Modo fallback activo.")

    def is_ready(self) -> bool:
        return self._ready

    def _preprocess(self, data: dict) -> np.ndarray:
        presupuesto = float(data.get('presupuesto_max', 50000))
        tipo_prop = str(data.get('tipo_prop_pref', '')).lower().strip()
        try:
            tipo_enc = self._le_tipo.transform([tipo_prop])[0]
        except (ValueError, AttributeError):
            tipo_enc = 1
        hab = int(data.get('habitaciones_pref', 2))
        zona = str(data.get('zona_pref', '')).lower().strip()
        try:
            zona_enc = self._le_zona.transform([zona])[0]
        except (ValueError, AttributeError):
            zona_enc = 5
        n_busq = int(data.get('n_busquedas', 0))
        interacciones = int(data.get('interacciones', 0))
        raw = np.array([[presupuesto, tipo_enc, hab, zona_enc, n_busq, interacciones]])
        return self._scaler.transform(raw)

    def segment_client(self, data: dict) -> dict:
        if self._ready:
            try:
                X   = self._preprocess(data)
                seg = int(self._model.predict(X)[0])
                return self._build_result(seg, data)
            except Exception as e:
                logger.error(f"Error en segment_client: {e}")

        return self._fallback(data)

    def _build_result(self, seg_id: int, data: dict) -> dict:
        info = SEGMENTOS.get(seg_id, SEGMENTOS[4])
        return {
            'segmento_id':     seg_id,
            'segmento_nombre': info['nombre'],
            'descripcion':     info['desc'],
            'recomendaciones': self._get_recommendations(seg_id, data),
            'modo': 'modelo',
        }

    def _fallback(self, data: dict) -> dict:
        presupuesto = float(data.get('presupuesto_max', 50000))
        if presupuesto > 200000:   seg_id = 0
        elif presupuesto > 100000: seg_id = 2
        elif presupuesto > 50000:  seg_id = 3
        elif presupuesto > 20000:  seg_id = 4
        else:                      seg_id = 1
        result = self._build_result(seg_id, data)
        result['modo'] = 'fallback_reglas'
        return result

    def _get_recommendations(self, seg_id: int, data: dict) -> list:
        recs = {
            0: ["Considere propiedades en Equipetrol Norte",
                "Opciones con piscina y seguridad 24h disponibles"],
            1: ["Departamentos en zona central desde $30.000",
                "Opciones de alquiler disponibles en su zona preferida"],
            2: ["Terrenos en zonas de alta plusvalía",
                "Locales comerciales con alta rentabilidad"],
            3: ["Casas con jardín en zonas residenciales seguras",
                "Colegios y servicios cercanos en Sirari y Banzer"],
            4: ["Departamentos modernos con ascensor",
                "Zonas con alta conectividad y vida nocturna"],
        }
        return recs.get(seg_id, [])

clustering_service = ClientClusteringService()
