from django.urls import path
from .views import ValuationView

urlpatterns = [
    path('predict/', ValuationView.as_view(), name='valuation-predict'),
]
