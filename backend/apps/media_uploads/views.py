from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import MediaUpload
from .serializers import MediaUploadSerializer, MediaUploadCreateSerializer


class MediaUploadListCreateView(generics.ListCreateAPIView):
    """GET /api/uploads/ — list uploads for current user
       POST /api/uploads/ — upload a new image or video"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pet', 'media_type', 'status']

    def get_queryset(self):
        return MediaUpload.objects.filter(user=self.request.user).select_related('pet')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MediaUploadCreateSerializer
        return MediaUploadSerializer


class MediaUploadDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE /api/uploads/{id}/"""
    serializer_class = MediaUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MediaUpload.objects.filter(user=self.request.user)
