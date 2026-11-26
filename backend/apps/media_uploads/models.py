from django.db import models
from django.conf import settings


class MediaUpload(models.Model):
    MEDIA_TYPE_CHOICES = [('image', 'Image'), ('video', 'Video')]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]

    pet = models.ForeignKey(
        'pets.Pet', on_delete=models.CASCADE, related_name='uploads'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploads'
    )
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/%d/', null=True, blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveBigIntegerField(help_text='File size in bytes')
    mime_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ready')
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.pet.name} – {self.original_filename}'

    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)
