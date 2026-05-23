from config.celery import app
from .models import Client, ClientRecommendation
from .clustering_service import clustering_service
import logging
logger = logging.getLogger(__name__)

@app.task(bind=True, max_retries=3)
def segment_client_async(self, client_id: int):
    try:
        client = Client.objects.get(id=client_id)
        data = {
            'presupuesto_max':   float(client.presupuesto_max or 0),
            'tipo_prop_pref':    client.tipo_prop_pref,
            'habitaciones_pref': client.habitaciones_pref or 2,
            'zona_pref':         client.zona_pref,
            'n_busquedas':       client.n_busquedas,
            'interacciones':     client.interacciones,
        }
        result = clustering_service.segment_client(data)
        client.segmento_id     = result['segmento_id']
        client.segmento_nombre = result['segmento_nombre']
        client.save(update_fields=['segmento_id','segmento_nombre','updated_at'])

        ClientRecommendation.objects.filter(client=client).delete()
        for rec in result.get('recomendaciones', []):
            ClientRecommendation.objects.create(
                client=client, titulo=rec, descripcion=rec, score=1.0)
        logger.info(f"Cliente {client_id} segmentado: {result['segmento_nombre']}")
    except Exception as exc:
        logger.error(f"segment_client_async error {client_id}: {exc}")
        raise self.retry(exc=exc, countdown=10)
