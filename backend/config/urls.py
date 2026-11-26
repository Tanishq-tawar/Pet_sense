from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/pets/', include('apps.pets.urls')),
    path('api/uploads/', include('apps.media_uploads.urls')),
    path('api/analysis/', include('apps.analysis.urls')),
    path('api/reminders/', include('apps.reminders.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
