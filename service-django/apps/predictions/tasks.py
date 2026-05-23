# apps/predictions/tasks.py
from celery import shared_task
from .models import PredictionJob

@shared_task
def run_prediction_async(job_id: int, features: list):
    job = PredictionJob.objects.get(id=job_id)
    job.status = 'running'
    job.save()
    try:
        from .ml_service import ml_service
        result = ml_service.predict(features)
        job.result = result[0]
        job.status = 'done'
    except Exception as e:
        job.status = 'failed'
        job.error = str(e)
    job.save()