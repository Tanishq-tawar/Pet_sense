from django.urls import path
from .views import MediaUploadListCreateView, MediaUploadDetailView

urlpatterns = [
    path('', MediaUploadListCreateView.as_view(), name='upload-list-create'),
    path('<int:pk>/', MediaUploadDetailView.as_view(), name='upload-detail'),
]
