from django.contrib import admin
from .models import Client, ClientRecommendation

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display  = ['id','nombres','email','segmento_nombre','presupuesto_max']
    list_filter   = ['segmento_nombre','tipo_prop_pref']
    search_fields = ['nombres','email']

@admin.register(ClientRecommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ['id','client','titulo','score']
