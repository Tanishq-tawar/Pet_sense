from django.contrib import admin
from .models import MediaUpload


@admin.register(MediaUpload)
class MediaUploadAdmin(admin.ModelAdmin):
    list_display = ['pet', 'user', 'media_type', 'original_filename', 'file_size_mb', 'status', 'uploaded_at']
    list_filter = ['media_type', 'status']
    search_fields = ['pet__name', 'user__email', 'original_filename']
    raw_id_fields = ['pet', 'user']
