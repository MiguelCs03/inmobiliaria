from django.db.models import Count, Avg
from .models import Client


class ClientsKPIService:
    def get_kpi(self, zona_pref: str | None = None,
                tipo_prop_pref: str | None = None,
                segmento_id: int | None = None) -> dict:
        qs = Client.objects.all()

        if zona_pref:
            qs = qs.filter(zona_pref__iexact=zona_pref)
        if tipo_prop_pref:
            qs = qs.filter(tipo_prop_pref__iexact=tipo_prop_pref)
        if segmento_id is not None:
            qs = qs.filter(segmento_id=segmento_id)

        total = qs.count()

        agg = qs.aggregate(
            avg_budget=Avg('presupuesto_max'),
            avg_searches=Avg('n_busquedas'),
            avg_interactions=Avg('interacciones'),
        )

        segment_distribution = (
            qs.values('segmento_id', 'segmento_nombre')
            .annotate(count=Count('id'), avg_budget=Avg('presupuesto_max'))
            .order_by('-count')
        )

        by_zone = (
            qs.values('zona_pref')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        by_type = (
            qs.values('tipo_prop_pref')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return {
            'total_clients':      total,
            'avg_budget':         round(float(agg['avg_budget'] or 0), 2),
            'avg_searches':       round(float(agg['avg_searches'] or 0), 1),
            'avg_interactions':   round(float(agg['avg_interactions'] or 0), 1),
            'by_segment':         list(segment_distribution),
            'by_zone':            list(by_zone),
            'by_type':            list(by_type),
        }


clients_kpi_service = ClientsKPIService()
