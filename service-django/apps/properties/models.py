"""
Modelos de solo lectura que mapean las tablas existentes de TypeORM.
managed = False => Django NO crea ni modifica estas tablas.
"""
from django.db import models

class TipoPropiedad(models.Model):
    nombre = models.CharField(max_length=50)
    class Meta:
        managed = False
        db_table = 'tipo_propiedad'

class TipoOperacion(models.Model):
    nombre = models.CharField(max_length=50)
    class Meta:
        managed = False
        db_table = 'tipo_operacion'

class EstadoPropiedad(models.Model):
    nombre = models.CharField(max_length=50)
    class Meta:
        managed = False
        db_table = 'estado_propiedad'

class Propietario(models.Model):
    nombres  = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    ci_nit   = models.CharField(max_length=30)
    class Meta:
        managed = False
        db_table = 'propietario'

class Propiedad(models.Model):
    propietario      = models.ForeignKey(Propietario, on_delete=models.DO_NOTHING, db_column='propietario_id')
    tipo_propiedad   = models.ForeignKey(TipoPropiedad, on_delete=models.DO_NOTHING, db_column='tipo_propiedad_id')
    tipo_operacion   = models.ForeignKey(TipoOperacion, on_delete=models.DO_NOTHING, db_column='tipo_operacion_id')
    estado_propiedad = models.ForeignKey(EstadoPropiedad, on_delete=models.DO_NOTHING, db_column='estado_propiedad_id')
    precio_base      = models.DecimalField(max_digits=12, decimal_places=2)
    area_m2          = models.DecimalField(max_digits=10, decimal_places=2)
    ubicacion        = models.CharField(max_length=255, null=True)
    detalles_json    = models.JSONField(null=True)
    class Meta:
        managed = False
        db_table = 'propiedad'
