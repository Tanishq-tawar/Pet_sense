from rest_framework import serializers
from .models import MediaUpload


class MediaUploadSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    has_analysis = serializers.SerializerMethodField()

    class Meta:
        model = MediaUpload
        fields = [
            'id', 'pet', 'pet_name', 'file', 'thumbnail', 'media_type',
            'original_filename', 'file_size', 'file_size_mb', 'mime_type',
            'status', 'description', 'has_analysis', 'uploaded_at',
        ]
        read_only_fields = [
            'id', 'user', 'media_type', 'original_filename', 'file_size',
            'mime_type', 'status', 'uploaded_at',
        ]

    def get_has_analysis(self, obj):
        return hasattr(obj, 'analysis')


class MediaUploadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaUpload
        fields = ['id', 'pet', 'file', 'description']

    def validate_pet(self, pet):
        request = self.context['request']
        if pet.owner != request.user:
            raise serializers.ValidationError('You do not own this pet.')
        return pet

    def validate_file(self, file):
        from django.conf import settings
        allowed = settings.ALLOWED_MEDIA_TYPES
        max_size = settings.MAX_UPLOAD_SIZE
        if file.size > max_size:
            raise serializers.ValidationError(
                f'File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB} MB.'
            )
        content_type = file.content_type
        if content_type not in allowed:
            raise serializers.ValidationError(
                f'Unsupported file type: {content_type}. '
                f'Allowed types: JPEG, PNG, WebP, MP4, MOV, WebM.'
            )
        return file

    def create(self, validated_data):
        from django.conf import settings
        file = validated_data['file']
        content_type = file.content_type
        media_type = 'image' if content_type in settings.ALLOWED_IMAGE_TYPES else 'video'

        upload = MediaUpload.objects.create(
            user=self.context['request'].user,
            media_type=media_type,
            original_filename=file.name,
            file_size=file.size,
            mime_type=content_type,
            **validated_data,
        )

        # Generate thumbnail for images
        if media_type == 'image':
            upload = self._generate_thumbnail(upload)

        return upload

    def _generate_thumbnail(self, upload):
        try:
            from PIL import Image
            import io
            from django.core.files.base import ContentFile

            with Image.open(upload.file.path) as img:
                img.thumbnail((400, 400))
                buf = io.BytesIO()
                fmt = 'JPEG' if img.mode in ('RGB', 'L') else 'PNG'
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                img.save(buf, format=fmt)
                upload.thumbnail.save(
                    f'thumb_{upload.pk}.jpg',
                    ContentFile(buf.getvalue()),
                    save=True,
                )
        except Exception:
            pass  # Thumbnail generation is non-critical
        return upload
