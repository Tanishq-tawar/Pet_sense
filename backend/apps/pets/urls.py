from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BreedViewSet, PetViewSet

router = DefaultRouter()
router.register(r'breeds', BreedViewSet, basename='breed')
router.register(r'', PetViewSet, basename='pet')

urlpatterns = [
    path('', include(router.urls)),
]
