# apps/predictions/models.py
from django.db import models

class PredictionJob(models.Model):
    STATUS = [('pending','Pending'),('running','Running'),
              ('done','Done'),('failed','Failed')]
    features  = models.JSONField()
    result    = models.FloatField(null=True)
    status    = models.CharField(max_length=10, choices=STATUS, default='pending')
    error     = models.TextField(blank=True)
    created   = models.DateTimeField(auto_now_add=True)