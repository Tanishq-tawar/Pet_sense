from rest_framework import serializers
from .models import HealthAnalysis, AnalysisObservation, HealthReport
from apps.media_uploads.serializers import MediaUploadSerializer


class ObservationSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = AnalysisObservation
        fields = [
            'id', 'category', 'category_display', 'title', 'description',
            'severity', 'severity_display', 'confidence', 'recommendation', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class HealthReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthReport
        fields = ['id', 'summary', 'recommendations', 'disclaimer', 'pdf_file', 'created_at']
        read_only_fields = ['id', 'created_at']


class HealthAnalysisListSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='upload.pet.name', read_only=True)
    breed_name = serializers.CharField(source='upload.pet.breed.name', read_only=True)
    pet_id = serializers.IntegerField(source='upload.pet.id', read_only=True)
    observations_count = serializers.SerializerMethodField()
    has_report = serializers.SerializerMethodField()
    upload_thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = HealthAnalysis
        fields = [
            'id', 'pet_id', 'pet_name', 'breed_name', 'status', 'mode', 'overall_assessment',
            'observations_count', 'has_report', 'upload_thumbnail',
            'started_at', 'completed_at', 'created_at',
        ]

    def get_observations_count(self, obj):
        return obj.observations.count()

    def get_has_report(self, obj):
        return hasattr(obj, 'report')

    def get_upload_thumbnail(self, obj):
        request = self.context.get('request')
        thumb = obj.upload.thumbnail
        if thumb and request:
            return request.build_absolute_uri(thumb.url)
        return None


class HealthAnalysisDetailSerializer(serializers.ModelSerializer):
    upload = MediaUploadSerializer(read_only=True)
    observations = ObservationSerializer(many=True, read_only=True)
    report = HealthReportSerializer(read_only=True)
    pet_name = serializers.CharField(source='upload.pet.name', read_only=True)
    pet_id = serializers.IntegerField(source='upload.pet.id', read_only=True)
    breed_name = serializers.CharField(source='upload.pet.breed.name', read_only=True)
    summary = serializers.CharField(source='report.summary', default='', read_only=True)
    upload_thumbnail = serializers.SerializerMethodField()
    observations_count = serializers.SerializerMethodField()

    class Meta:
        model = HealthAnalysis
        fields = [
            'id', 'pet_id', 'pet_name', 'breed_name', 'upload', 'status', 'mode',
            'overall_assessment', 'summary', 'upload_thumbnail', 'observations_count',
            'observations', 'report',
            'started_at', 'completed_at', 'error_message', 'created_at',
        ]

    def get_upload_thumbnail(self, obj):
        request = self.context.get('request')
        thumb = obj.upload.thumbnail
        if thumb and request:
            return request.build_absolute_uri(thumb.url)
        return None

    def get_observations_count(self, obj):
        return obj.observations.count()
