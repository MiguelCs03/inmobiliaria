"""
Entrena Random Forest para predicción de precio de propiedades.
Uso: python ml_models/random_forest/train.py
"""
import pandas as pd, numpy as np, joblib
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import warnings; warnings.filterwarnings('ignore')

CSV_PATH = 'ml_models/random_forest/data/ML_Supervisado_Prediccion_Precio (1).csv'
MODEL_PATH = 'ml_models/random_forest/models/random_forest_v1.pkl'

df = pd.read_csv(CSV_PATH)
print(f'RF — Datos cargados: {df.shape}')

df['anio_construido'] = 2026 - df['antiguedad_anos']
le_zona = LabelEncoder()
df['zona_enc'] = le_zona.fit_transform(df['zona'])

FEATURES = ['superficie_total_m2','habitaciones','banos','anio_construido','zona_enc','anillo_vial']
TARGET = 'precio_total_usd'

X = df[FEATURES]
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

params = dict(n_estimators=200, max_depth=20, min_samples_leaf=5, n_jobs=-1, random_state=42)
model = RandomForestRegressor(**params)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f'RF — MAE: ${mae:,.0f} | R²: {r2:.4f}')

Path(MODEL_PATH).parent.mkdir(parents=True, exist_ok=True)
joblib.dump({"model": model, "le_zona": le_zona, "features": FEATURES}, MODEL_PATH)
print(f'RF — Guardado en {MODEL_PATH}')
