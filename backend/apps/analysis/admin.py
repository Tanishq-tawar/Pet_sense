from django.contrib import admin
from .models import HealthAnalysis, AnalysisObservation, HealthReport


class ObservationInline(admin.TabularInline):
    model = AnalysisObservation
    extra = 0
    readonly_fields = ['created_at']


@admin.register(HealthAnalysis)
class HealthAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_pet', 'status', 'mode', 'created_at']
    list_filter = ['status', 'mode']
    inlines = [ObservationInline]

    def get_pet(self, obj):
        return obj.upload.pet.name
    get_pet.short_description = 'Pet'


@admin.register(HealthReport)
class HealthReportAdmin(admin.ModelAdmin):
    list_display = ['analysis', 'created_at']
