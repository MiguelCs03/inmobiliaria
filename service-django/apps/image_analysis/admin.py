from django.contrib import admin
from .models import PropertyImage

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display  = ['id','propiedad_id','status','conservation_state','room_type','created_at']
    list_filter   = ['status','conservation_state','room_type']
    readonly_fields = ['full_result','analyzed_at']
