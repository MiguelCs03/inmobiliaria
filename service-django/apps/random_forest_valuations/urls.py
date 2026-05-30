from django.urls import path
from .views import ValuationView, ValuationAsyncView, ValuationJobStatusView

urlpatterns = [
    path('predict/',         ValuationView.as_view(),      name='valuation-predict'),
    path('predict-async/',   ValuationAsyncView.as_view(), name='valuation-predict-async'),
    path('job/<int:pk>/',    ValuationJobStatusView.as_view(), name='valuation-job'),
]
