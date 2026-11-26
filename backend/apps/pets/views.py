from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Breed, Pet, PetMedicalHistory, Vaccination, Allergy
from .serializers import (
    BreedSerializer, PetListSerializer, PetDetailSerializer,
    MedicalHistorySerializer, VaccinationSerializer, AllerySerializer,
)


class BreedViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/pets/breeds/ — public list of supported breeds"""
    queryset = Breed.objects.filter(is_supported=True)
    serializer_class = BreedSerializer
    permission_classes = [permissions.AllowAny]


class PetViewSet(viewsets.ModelViewSet):
    """CRUD for pets. Users see only their own pets."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['breed', 'gender', 'is_active']

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user).select_related('breed')

    def get_serializer_class(self):
        if self.action in ['list']:
            return PetListSerializer
        return PetDetailSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='medical-history')
    def medical_history(self, request, pk=None):
        pet = self.get_object()
        if request.method == 'GET':
            entries = pet.medical_history.all()
            return Response(MedicalHistorySerializer(entries, many=True).data)
        serializer = MedicalHistorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(pet=pet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='vaccinations')
    def vaccinations(self, request, pk=None):
        pet = self.get_object()
        if request.method == 'GET':
            items = pet.vaccinations.all()
            return Response(VaccinationSerializer(items, many=True).data)
        serializer = VaccinationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(pet=pet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='allergies')
    def allergies(self, request, pk=None):
        pet = self.get_object()
        if request.method == 'GET':
            items = pet.allergies.all()
            return Response(AllerySerializer(items, many=True).data)
        serializer = AllerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(pet=pet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
