import pandas as pd
import numpy as np
from pathlib import Path
from django.conf import settings

CSV_PATH = Path(settings.ML_MODELS_DIR) / 'random_forest/data/ML_Supervisado_Prediccion_Precio (1).csv'

_null_df = pd.DataFrame()


class ValuationsKPIService:
    _df: pd.DataFrame | None = None

    def _load(self) -> pd.DataFrame:
        if self._df is not None:
            return self._df
        path = CSV_PATH
        if not path.exists():
            return _null_df
        try:
            self._df = pd.read_csv(path)
            return self._df
        except Exception:
            return _null_df

    def get_kpi(self, zona: str | None = None,
                tipo_propiedad: str | None = None) -> dict:
        df = self._load()

        if zona:
            df = df[df['zona'].str.lower().str.contains(zona.lower(), na=False)]
        if tipo_propiedad:
            df = df[df['tipo_propiedad'].str.lower() == tipo_propiedad.lower()]

        if df.empty:
            return {'total_properties': 0, 'avg_price': 0, 'avg_price_m2': 0,
                    'price_range': {'min': 0, 'max': 0},
                    'avg_surface': {'total': 0, 'construida': 0},
                    'avg_rooms': 0, 'avg_bathrooms': 0,
                    'by_zone': [], 'by_type': [], 'by_rooms': []}

        total = int(len(df))
        avg_price = round(float(df['precio_total_usd'].mean()), 2)
        avg_price_m2 = round(float(df['precio_m2_usd'].mean()), 2)
        price_range = {
            'min': round(float(df['precio_total_usd'].min()), 2),
            'max': round(float(df['precio_total_usd'].max()), 2),
        }
        avg_surface = {
            'total': round(float(df['superficie_total_m2'].mean()), 1),
            'construida': round(float(df['superficie_construida_m2'].mean()), 1),
        }
        avg_rooms = round(float(df['habitaciones'].mean()), 1)
        avg_bathrooms = round(float(df['banos'].mean()), 1)

        # Agrupaciones
        by_zone = (
            df.groupby('zona')
            .agg(count=('precio_total_usd', 'count'),
                 avg_price=('precio_total_usd', 'mean'))
            .assign(avg_price=lambda x: round(x['avg_price'], 2))
            .reset_index()
            .rename(columns={'zona': 'label'})
            .to_dict(orient='records')
        )
        by_type = (
            df.groupby('tipo_propiedad')
            .agg(count=('precio_total_usd', 'count'),
                 avg_price=('precio_total_usd', 'mean'))
            .assign(avg_price=lambda x: round(x['avg_price'], 2))
            .reset_index()
            .rename(columns={'tipo_propiedad': 'label'})
            .to_dict(orient='records')
        )
        by_rooms = (
            df.groupby('habitaciones')
            .agg(count=('precio_total_usd', 'count'),
                 avg_price=('precio_total_usd', 'mean'))
            .assign(avg_price=lambda x: round(x['avg_price'], 2))
            .reset_index()
            .rename(columns={'habitaciones': 'label'})
            .to_dict(orient='records')
        )

        return {
            'total_properties': total,
            'avg_price':        avg_price,
            'avg_price_m2':     avg_price_m2,
            'price_range':      price_range,
            'avg_surface':      avg_surface,
            'avg_rooms':        avg_rooms,
            'avg_bathrooms':    avg_bathrooms,
            'by_zone':          by_zone,
            'by_type':          by_type,
            'by_rooms':         by_rooms,
        }


valuations_kpi_service = ValuationsKPIService()
