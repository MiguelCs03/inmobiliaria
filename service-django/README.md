# Sistema Inmobiliario — Django ML/DL API

## Arquitectura
- **NestJS** — CRUD principal, contratos, pagos, auth
- **Django** — Módulos de IA (Random Forest, K-Means, CNN)
- **Angular** (web) + **React Native** (móvil) — Frontends
- **PostgreSQL** — BD compartida (tablas TypeORM + tablas Django)
- **Redis + Celery** — Tareas asíncronas pesadas
## Endpoints principales

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/valuations/predict/` | Predicción precio inmediata (RF) |
| POST | `/api/v1/valuations/predict-async/` | Predicción precio async |
| GET  | `/api/v1/valuations/job/<id>/` | Estado de job de valuación |
| POST | `/api/v1/clients/segmentar/` | Segmentación cliente inmediata |
| POST | `/api/v1/clients/{id}/segmentar-y-guardar/` | Segmentación + guardar async |
| POST | `/api/v1/images/upload/` | Subir imagen para análisis CNN |
| GET  | `/api/v1/images/result/<id>/` | Resultado análisis CNN |
| GET  | `/api/v1/images/property/<id>/` | Imágenes de una propiedad |
| GET  | `/api/v1/properties/` | Listado propiedades (read-only TypeORM) |

## Entrenamiento de modelos

```bash
cd notebooks
jupyter notebook
```
- `01_train_random_forest.ipynb` → genera `ml_models/trained/random_forest_v1.pkl`
- `02_train_kmeans.ipynb` → genera `ml_models/trained/kmeans_clients_v1.pkl`
- `03_train_cnn.ipynb` → genera `ml_models/trained/cnn_property.pt`

## Tablas que crea Django (nuevas)
- `valuations_valuationjob`
- `clients_client`
- `clients_clientrecommendation`
- `image_analysis_propertyimage`

## Tablas de TypeORM (solo lectura desde Django)
- `propiedad`, `propietario`, `cliente`, `contrato`, `propiedad_imagen`...

# 1. Activar venv
venv\Scripts\activate

# 2. Migrar BD
python manage.py migrate

# 3. Crear superusuario (si no existe)
python manage.py createsuperuser

# 4. Entrenar modelos (desde notebooks/)
jupyter notebook        # → ejecutar los 3 notebooks

# 5a. Servidor Django
python manage.py runserver

# 5b. Celery worker (otra terminal, mismo venv)
celery -A config worker -l info --pool=solo



sobre docker

# Construir imágenes y levantar todo
docker compose up -d --build

# Ver contenedores corriendo
docker compose ps

# Ver logs de un servicio
docker compose logs web
docker compose logs worker

# Detener todo
docker compose down

# Solo un servicio (ej: redis)
docker compose up redis -d





# Docker Start (prender pc)
docker compose up -d

# Docker Stop (apagar pc)
docker compose down


