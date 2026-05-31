from django.urls import path
from .views import ValuationView, ValuationsKPIView

urlpatterns = [
    path('predict/', ValuationView.as_view(), name='valuation-predict'),
    path('kpi/', ValuationsKPIView.as_view(), name='valuation-kpi'),
]
