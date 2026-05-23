from django.urls import path
from .views import TrainingStatusView
urlpatterns = [
    path('status/', TrainingStatusView.as_view(), name='training-status'),
]
