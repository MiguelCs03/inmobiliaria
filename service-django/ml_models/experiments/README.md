# Experimentos ML — Inmobiliaria

## Requisitos

- Token de autenticación (reemplazar `MI_TOKEN` en cada comando)
- Servidor Django corriendo en `http://localhost:8000`

Obtener token (admin):
```powershell
docker compose exec -T web python manage.py shell -c "from rest_framework.authtoken.models import Token; t = Token.objects.get_or_create(user__username='admin')[0]; print(t.key)"
```

---

## 1. Valuations — Predicción de precios (Random Forest)

### Síncrono

```powershell
curl.exe -s -X POST http://localhost:8000/api/v1/valuations/predict/ `
  -H "Authorization: Token MI_TOKEN" `
  -H "Content-Type: application/json" `
  -d "@ml_models/experiments/valuations_payload.json"
```

Payload: `valuations_payload.json`

| Campo | Tipo | Requerido | Default |
|---|---|---|---|
| `metros_cuad` | float | sí | — |
| `habitaciones` | int | sí | — |
| `banos` | int | sí | — |
| `anio_construc` | int | sí | — |
| `barrio` | string | sí | — |
| `ciudad` | string | no | `"Santa Cruz"` |
| `anillo_vial` | int | no | `3` |
| `tipo_propiedad` | string | no | — |
| `tipo_operacion` | string | no | — |

Respuesta esperada:
```json
{
  "precio_estimado": 48994.44,
  "rango_min": 33155.95,
  "rango_max": 59530.14,
  "modo": "modelo"
}
```

### Asíncrono (vía Celery)

```powershell
REM 1. Enviar tarea
curl.exe -s -X POST http://localhost:8000/api/v1/valuations/predict-async/ `
  -H "Authorization: Token MI_TOKEN" `
  -H "Content-Type: application/json" `
  -d "@ml_models/experiments/valuations_payload_async.json"

REM 2. Consultar resultado (reemplazar JOB_ID)
curl.exe -s http://localhost:8000/api/v1/valuations/job/JOB_ID/ `
  -H "Authorization: Token MI_TOKEN"
```

Payload async: `valuations_payload_async.json`

Respuesta async (202):
```json
{
  "job_id": 1,
  "status": "pending"
}
```

Respuesta job completado (200):
```json
{
  "id": 1,
  "propiedad_id": 1,
  "precio_estimado": "85000.00",
  "rango_min": "76500.00",
  "rango_max": "93500.00",
  "status": "done",
  "created_at": "2026-05-24T12:00:00Z"
}
```

---

## 2. Clients — Segmentación de clientes (K-Means)

### Segmentar un perfil (síncrono)

```powershell
curl.exe -s -X POST http://localhost:8000/api/v1/clients/segmentar/ `
  -H "Authorization: Token MI_TOKEN" `
  -H "Content-Type: application/json" `
  -d "@ml_models/experiments/clients_segmentar_payload.json"
```

Payload: `clients_segmentar_payload.json`

| Campo | Tipo | Requerido | Default |
|---|---|---|---|
| `presupuesto_max` | float | sí | — |
| `tipo_prop_pref` | string | no | `"Departamento"` |
| `habitaciones_pref` | int | no | `2` |
| `zona_pref` | string | no | `""` |
| `n_busquedas` | int | no | `0` |
| `interacciones` | int | no | `0` |

Respuesta esperada:
```json
{
  "segmento_id": 0,
  "segmento_nombre": "Comprador premium",
  "descripcion": "Alto presupuesto, busca propiedades exclusivas",
  "recomendaciones": [
    "Considere propiedades en Equipetrol Norte",
    "Opciones con piscina y seguridad 24h disponibles"
  ],
  "modo": "modelo"
}
```

### Crear cliente en BD

```powershell
curl.exe -s -X POST http://localhost:8000/api/v1/clients/ `
  -H "Authorization: Token MI_TOKEN" `
  -H "Content-Type: application/json" `
  -d "@ml_models/experiments/clients_create_payload.json"
```

### Segmentar y guardar cliente existente

```powershell
REM Reemplazar CLIENT_ID con el ID del cliente creado
curl.exe -s -X POST http://localhost:8000/api/v1/clients/CLIENT_ID/segmentar-y-guardar/ `
  -H "Authorization: Token MI_TOKEN"
```

---

## 3. Image Analysis — Análisis de imágenes (CNN ResNet18)

### Subir imagen para análisis

```powershell
REM Reemplazar RUTA_IMAGEN con la ruta a un archivo .jpg
curl.exe -s -X POST http://localhost:8000/api/v1/images/upload/ `
  -H "Authorization: Token MI_TOKEN" `
  -F "image=@RUTA_IMAGEN" `
  -F "propiedad_id=1"
```

Respuesta esperada:
```json
{
  "image_id": 1,
  "status": "pending",
  "message": "Imagen recibida. Análisis en progreso."
}
```

### Consultar resultado del análisis

```powershell
REM Reemplazar IMAGE_ID con el ID de la imagen subida
curl.exe -s http://localhost:8000/api/v1/images/result/IMAGE_ID/ `
  -H "Authorization: Token MI_TOKEN"
```

Respuesta esperada (cuando el análisis termine):
```json
{
  "id": 1,
  "propiedad_id": 1,
  "image": "/media/properties/1/foto.jpg",
  "status": "done",
  "conservation_state": "Excelente",
  "room_type": "Sala",
  "confidence_conservation": 0.92,
  "confidence_room": 0.87,
  "full_result": {
    "estado_conservacion": "Excelente",
    "confianza_conservacion": 0.9234,
    "tipo_ambiente": "Sala",
    "confianza_ambiente": 0.8712,
    "modo": "modelo"
  }
}
```

### Listar imágenes de una propiedad

```powershell
curl.exe -s http://localhost:8000/api/v1/images/property/1/ `
  -H "Authorization: Token MI_TOKEN"
```

---

## 4. Properties — Consultar propiedades (lectura)

```powershell
REM Listar propiedades
curl.exe -s http://localhost:8000/api/v1/properties/ `
  -H "Authorization: Token MI_TOKEN"

REM Filtrar por tipo
curl.exe -s "http://localhost:8000/api/v1/properties/?tipo_propiedad=Casa" `
  -H "Authorization: Token MI_TOKEN"

REM Obtener una propiedad por ID
curl.exe -s http://localhost:8000/api/v1/properties/1/ `
  -H "Authorization: Token MI_TOKEN"
```

---

## 5. Health check — Estado de modelos

```powershell
curl.exe -s http://localhost:8000/training/status/ `
  -H "Authorization: Token MI_TOKEN"
```

## Notas

- Los modelos entrenados están en `ml_models/trained/`
- Los payloads de ejemplo están en `ml_models/experiments/`
- Puerto DB Docker: `5433` (para no chocar con PostgreSQL local)
- Puerto DB local: `5432`
- Celery worker debe ejecutarse con `--pool=solo` en Windows
