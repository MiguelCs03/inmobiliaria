# service-django — API de Machine Learning

Microservicio de IA/ML del sistema inmobiliario. Expone modelos entrenados vía REST.

---

## Arquitectura

```
Gateway (:3001) ── /ia/* ──► service-django (:8000)
                                │
                                ├── PostgreSQL (:5433) — BD propia
                                │   └── inmobilaria_django
                                │
                                ├── Redis (:6379) — Celery broker
                                │
                                └── Celery worker — tareas asíncronas
```

- **No comparte BD** con ningún otro servicio
- Toda comunicación externa pasa por el **API Gateway** (`api-gateway/`)
- Si necesita datos de service-nest (propiedades, usuarios), los pide vía Gateway

---

## Endpoints

| Método | URL | Modelo | Descripción |
|--------|-----|--------|-------------|
| POST | `/api/v1/valuations/predict/` | Random Forest | Predicción de precio inmediata |
| POST | `/api/v1/valuations/predict-async/` | Random Forest | Predicción asíncrona (Celery) |
| GET | `/api/v1/valuations/job/<id>/` | — | Estado de job asíncrono |
| POST | `/api/v1/clients/segmentar/` | K-Means | Segmentar perfil de cliente |
| POST | `/api/v1/clients/{id}/segmentar-y-guardar/` | K-Means | Segmentar + guardar en BD |
| POST | `/api/v1/images/upload/` | CNN ResNet18 | Subir imagen para análisis |
| GET | `/api/v1/images/result/<id>/` | CNN ResNet18 | Resultado del análisis |
| GET | `/api/v1/images/property/<id>/` | — | Listar imágenes de propiedad |


## PostgreSQL — Conexión pgAdmin

La BD vive en Docker, puerto `5433` del host.

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Port | **5433** (no 5432) |
| User | `postgres` |
| Password | `9775137` |
| Database | `inmobilaria_django` |

**Importante:** Si ya tenés PostgreSQL local en puerto `5432`, no te confundas. La de Docker va por `5433`.

### Tablas

| Tabla | App | Descripción |
|---|---|---|
| `clients_client` | clients | Clientes con preferencias y segmento asignado |
| `clients_clientrecommendation` | clients | Recomendaciones personalizadas por cliente |
| `valuations_valuationjob` | valuations | Jobs de tasación asíncrona (pendientes/completados) |
| `image_analysis_propertyimage` | image_analysis | Imágenes subidas con resultados de CNN |
| `auth_user` | auth | Usuarios del Django admin |
| `authtoken_token` | auth | Tokens de autenticación API |

---

## Modelos entrenados

| Archivo | Algoritmo | Input | Output |
|---|---|---|---|
| `ml_models/trained/random_forest_v1.pkl` | Random Forest | superficie, habitaciones, baños, año, zona, anillo | precio estimado |
| `ml_models/trained/kmeans_clients_v1.pkl` | K-Means (5 clusters) | presupuesto, preferencias, búsquedas | segmento_id |
| `ml_models/trained/cnn_property.pt` | ResNet18 dual-head | imagen JPG | estado conservación + tipo ambiente |

### Entrenar desde cero

```powershell
python train_all.py
```

O por separado:

```powershell
python -c "from notebooks.train_random_forest import *; train_and_save()"
python -c "from notebooks.train_kmeans import *; train_and_save()"
python -c "from notebooks.train_cnn import *; train_and_save()"
```

---

## Docker — Comandos diarios

```powershell
# Iniciar todo (después de prender la PC)
docker compose up -d

# Ver estado
docker compose ps

# Ver logs de Django
docker compose logs -f web

# Ver logs de Celery
docker compose logs -f worker

# Reconstruir después de cambios en código
docker compose up -d --build

# Detener (antes de apagar PC)
docker compose down

# Detener + borrar BD (pérdida de datos)
docker compose down -v
```

### Migraciones y superusuario

```powershell
# Correr migraciones
docker compose exec -T web python manage.py migrate

# Crear superusuario
docker compose exec -T web python manage.py createsuperuser

# Obtener token
docker compose exec -T web python manage.py shell -c "
from rest_framework.authtoken.models import Token
t = Token.objects.get_or_create(user__username='admin')[0]
print(t.key)
"
```

### Copiar modelos al contenedor

```powershell
docker compose cp "ml_models\trained\." web:/app/ml_models/trained/
docker compose restart web
```

---

## Desarrollo local (sin Docker)

```powershell
venv\Scripts\activate
python manage.py migrate
python manage.py runserver
celery -A config worker -l info --pool=solo
```

Requiere PostgreSQL y Redis accesibles desde `localhost`.

---

## Dependencias principales

| Paquete | Versión | Uso |
|---|---|---|
| Django + DRF | 4.2 / 3.15 | API REST |
| scikit-learn | 1.4 | Random Forest + K-Means |
| PyTorch | 2.2 | ResNet18 CNN |
| Celery + Redis | 5.3 | Tareas asíncronas |
| psycopg2-binary | 2.9 | PostgreSQL |
| gunicorn | 22.0 | Servidor producción |
