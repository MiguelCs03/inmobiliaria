from django.db import models

class Client(models.Model):
    # Referencia al usuario de TypeORM (sin FK cruzada)
    usuario_id        = models.BigIntegerField(null=True, blank=True,
                            help_text="ID de usuario en tabla TypeORM")
    nombres           = models.CharField(max_length=100)
    email             = models.EmailField(max_length=150, unique=True)
    telefono          = models.CharField(max_length=20, blank=True)
    # Presupuesto y preferencias (para clustering)
    presupuesto_max   = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    tipo_prop_pref    = models.CharField(max_length=50, blank=True)
    habitaciones_pref = models.IntegerField(null=True, blank=True)
    zona_pref         = models.CharField(max_length=100, blank=True)
    n_busquedas       = models.IntegerField(default=0)
    interacciones     = models.IntegerField(default=0)
    # Resultado de clustering
    segmento_id       = models.IntegerField(null=True, blank=True)
    segmento_nombre   = models.CharField(max_length=100, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients_client'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombres} ({self.segmento_nombre or 'sin segmentar'})"

class ClientRecommendation(models.Model):
    client      = models.ForeignKey(Client, on_delete=models.CASCADE,
                                    related_name='recommendations')
    titulo      = models.CharField(max_length=200)
    descripcion = models.TextField()
    # ID de propiedad recomendada (tabla TypeORM)
    propiedad_id = models.BigIntegerField(null=True, blank=True)
    score       = models.FloatField(default=0.0)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clients_clientrecommendation'
        ordering = ['-score']
