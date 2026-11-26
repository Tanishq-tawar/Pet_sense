from rest_framework import serializers
from .models import Breed, Pet, PetMedicalHistory, Vaccination, Allergy


class BreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Breed
        fields = ['id', 'name', 'slug', 'description', 'common_conditions',
                  'average_lifespan_years', 'is_supported']


class AllerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'allergen', 'severity', 'reaction_description',
                  'diagnosed_date', 'created_at']
        read_only_fields = ['id', 'created_at']


class VaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccination
        fields = ['id', 'vaccine_name', 'administered_date', 'next_due_date',
                  'administered_by', 'batch_number', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PetMedicalHistory
        fields = ['id', 'condition', 'diagnosed_date', 'resolved_date', 'severity',
                  'treating_vet', 'notes', 'is_ongoing', 'created_at']
        read_only_fields = ['id', 'created_at']


class PetListSerializer(serializers.ModelSerializer):
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    upload_count = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = ['id', 'name', 'breed', 'breed_name', 'gender', 'date_of_birth',
                  'weight_kg', 'photo', 'is_active', 'upload_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_upload_count(self, obj):
        return obj.uploads.count()


class PetDetailSerializer(serializers.ModelSerializer):
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    breed_detail = BreedSerializer(source='breed', read_only=True)
    medical_history = MedicalHistorySerializer(many=True, read_only=True)
    vaccinations = VaccinationSerializer(many=True, read_only=True)
    allergies = AllerySerializer(many=True, read_only=True)
    upload_count = serializers.SerializerMethodField()
    age_years = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = [
            'id', 'name', 'breed', 'breed_name', 'breed_detail', 'gender',
            'date_of_birth', 'age_years', 'weight_kg', 'height_cm', 'photo',
            'microchip_id', 'notes', 'is_active', 'upload_count',
            'medical_history', 'vaccinations', 'allergies',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_upload_count(self, obj):
        return obj.uploads.count()

    def get_age_years(self, obj):
        if not obj.date_of_birth:
            return None
        from datetime import date
        today = date.today()
        dob = obj.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
