from django.db import models

class ValuationJob(models.Model):
    STATUS = [('pending','Pendiente'),('done','Listo'),('failed','Fallido')]
    # referencia a propiedad de TypeORM (sin FK cruzada)
    propiedad_id    = models.BigIntegerField(null=True, blank=True,
                        help_text="ID de la tabla propiedad (TypeORM)")
    input_data      = models.JSONField()
    precio_estimado = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    rango_min       = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    rango_max       = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    status          = models.CharField(max_length=10, choices=STATUS, default='pending')
    error           = models.TextField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'valuations_valuationjob'
        ordering = ['-created_at']
