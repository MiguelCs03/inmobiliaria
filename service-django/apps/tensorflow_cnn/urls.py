from django.urls import path
from .views import PredictView, PredictUrlView

urlpatterns = [
    path('predict/', PredictView.as_view(), name='tf-predict'),
    path('predict-url/', PredictUrlView.as_view(), name='tf-predict-url'),
]
