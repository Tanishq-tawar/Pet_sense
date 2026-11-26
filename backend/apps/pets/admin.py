from django.contrib import admin
from .models import Breed, Pet, PetMedicalHistory, Vaccination, Allergy


@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_supported', 'average_lifespan_years']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'breed', 'gender', 'is_active', 'created_at']
    list_filter = ['breed', 'gender', 'is_active']
    search_fields = ['name', 'owner__email']
    raw_id_fields = ['owner']


@admin.register(PetMedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = ['pet', 'condition', 'severity', 'is_ongoing', 'diagnosed_date']
    list_filter = ['severity', 'is_ongoing']


@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
    list_display = ['pet', 'vaccine_name', 'administered_date', 'next_due_date']


@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ['pet', 'allergen', 'severity']
