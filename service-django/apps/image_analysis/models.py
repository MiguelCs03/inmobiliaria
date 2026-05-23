from django.db import models
from django.utils import timezone

def image_upload_path(instance, filename):
    return f"properties/{instance.propiedad_id}/{filename}"

class PropertyImage(models.Model):
    STATUS = [
        ('pending',    'Pendiente'),
        ('processing', 'Procesando'),
        ('done',       'Listo'),
        ('failed',     'Fallido'),
    ]
    CONSERVATION = [
        ('Excelente',  'Excelente'),
        ('Bueno',      'Bueno'),
        ('Regular',    'Regular'),
        ('Deteriorado','Deteriorado'),
        ('Ruinoso',    'Ruinoso'),
    ]
    ROOM_TYPE = [
        ('Sala',      'Sala'),
        ('Cocina',    'Cocina'),
        ('Dormitorio','Dormitorio'),
        ('Bano',      'Baño'),
        ('Exterior',  'Exterior'),
        ('Garaje',    'Garaje'),
        ('Terraza',   'Terraza'),
        ('Otro',      'Otro'),
    ]
    # Referencia a propiedad TypeORM
    propiedad_id           = models.BigIntegerField(
                                help_text="ID de propiedad en tabla TypeORM")
    image                  = models.ImageField(upload_to=image_upload_path)
    status                 = models.CharField(max_length=15, choices=STATUS, default='pending')
    # Resultados CNN
    conservation_state     = models.CharField(max_length=20, choices=CONSERVATION,
                                              null=True, blank=True)
    room_type              = models.CharField(max_length=20, choices=ROOM_TYPE,
                                              null=True, blank=True)
    confidence_conservation = models.FloatField(null=True, blank=True)
    confidence_room         = models.FloatField(null=True, blank=True)
    full_result             = models.JSONField(null=True, blank=True)
    error                   = models.TextField(null=True, blank=True)
    uploaded_by             = models.BigIntegerField(null=True, blank=True,
                                help_text="ID usuario (TypeORM)")
    created_at              = models.DateTimeField(auto_now_add=True)
    analyzed_at             = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'image_analysis_propertyimage'
        ordering = ['-created_at']

    def __str__(self):
        return f"Imagen prop:{self.propiedad_id} [{self.status}]"
