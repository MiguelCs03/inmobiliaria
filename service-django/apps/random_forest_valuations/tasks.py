from config.celery import app
from .models import ValuationJob
from .random_forest_service import rf_service
import logging
logger = logging.getLogger(__name__)

@app.task(bind=True, max_retries=3)
def predict_price_async(self, job_id: int):
    try:
        job = ValuationJob.objects.get(id=job_id)
        result = rf_service.predict_price(job.input_data)
        job.precio_estimado = result['precio_estimado']
        job.rango_min       = result['rango_min']
        job.rango_max       = result['rango_max']
        job.status          = 'done'
        job.save()
    except Exception as exc:
        logger.error(f"predict_price_async error job {job_id}: {exc}")
        try:
            job = ValuationJob.objects.get(id=job_id)
            job.status = 'failed'
            job.error  = str(exc)
            job.save()
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=10)
