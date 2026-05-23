from config.celery import app
from django.utils import timezone
from .models import PropertyImage
from .cnn_service import cnn_service
from .image_utils import optimize_image
import logging
logger = logging.getLogger(__name__)

@app.task(bind=True, max_retries=3)
def analyze_image_async(self, image_id: int):
    try:
        img_obj = PropertyImage.objects.get(id=image_id)
        img_obj.status = 'processing'
        img_obj.save(update_fields=['status'])

        path = img_obj.image.path
        optimize_image(path)

        result = cnn_service.analyze(path)

        img_obj.conservation_state      = result['estado_conservacion']
        img_obj.room_type               = result['tipo_ambiente']
        img_obj.confidence_conservation = result['confianza_conservacion']
        img_obj.confidence_room         = result['confianza_ambiente']
        img_obj.full_result             = result
        img_obj.status                  = 'done'
        img_obj.analyzed_at             = timezone.now()
        img_obj.save()
        logger.info(f"Imagen {image_id} analizada: {result['estado_conservacion']} / {result['tipo_ambiente']}")

    except Exception as exc:
        logger.error(f"analyze_image_async error imagen {image_id}: {exc}")
        try:
            img_obj = PropertyImage.objects.get(id=image_id)
            img_obj.status = 'failed'
            img_obj.error  = str(exc)
            img_obj.save(update_fields=['status','error'])
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=15)
