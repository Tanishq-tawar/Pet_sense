from django.contrib import admin
from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'pet', 'reminder_type', 'due_date', 'is_complete']
    list_filter = ['reminder_type', 'is_complete']
    search_fields = ['title', 'user__email', 'pet__name']
