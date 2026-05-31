"""
Entrena K-Means para segmentación de clientes.
Uso: python models_ML_DL/kmeans/train.py
"""
import pandas as pd, numpy as np, joblib
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score
import warnings; warnings.filterwarnings('ignore')

CSV_PATH = 'models_ML_DL/kmeans/data/ML_NoSupervisado_Clustering_Clientes (1).csv'
MODEL_PATH = 'models_ML_DL/kmeans/models/kmeans_clients_v1.pkl'

df = pd.read_csv(CSV_PATH)
print(f'KM — Datos cargados: {df.shape}')

le_tipo = LabelEncoder()
df['tipo_enc'] = le_tipo.fit_transform(df['tipo_propiedad_buscada'].fillna('Departamento'))
le_zona = LabelEncoder()
df['zona_enc'] = le_zona.fit_transform(df['zona_preferida_1'].fillna(''))

FEATURES = ['presupuesto_max_usd','tipo_enc','habitaciones_minimo','zona_enc','propiedades_vistas','contactos_realizados']
X = df[FEATURES].fillna(0)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

K = 5
km = KMeans(n_clusters=K, random_state=42, n_init=20, max_iter=500)
km.fit(X_scaled)
sil = silhouette_score(X_scaled, km.labels_)
print(f'KM — Silhouette: {sil:.4f}')

Path(MODEL_PATH).parent.mkdir(parents=True, exist_ok=True)
bundle = {"kmeans": km, "scaler": scaler, "le_tipo": le_tipo, "le_zona": le_zona, "features": FEATURES}
joblib.dump(bundle, MODEL_PATH)
print(f'KM — Guardado en {MODEL_PATH}')
