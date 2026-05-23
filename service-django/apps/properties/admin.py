from django.contrib import admin
from .models import Propiedad
@admin.register(Propiedad)
class PropiedadAdmin(admin.ModelAdmin):
    list_display = ['id','ubicacion','precio_base','area_m2']
    list_filter  = ['tipo_propiedad','tipo_operacion']
