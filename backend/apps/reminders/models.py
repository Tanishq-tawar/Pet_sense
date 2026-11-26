from django.db import models
from django.conf import settings


class Reminder(models.Model):
    TYPE_CHOICES = [
        ('vaccination', 'Vaccination'),
        ('vet_checkup', 'Vet Checkup'),
        ('follow_up', 'Follow-up Appointment'),
        ('medication', 'Medication'),
        ('grooming', 'Grooming'),
        ('profile_update', 'Profile Update'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders'
    )
    pet = models.ForeignKey(
        'pets.Pet', on_delete=models.CASCADE, related_name='reminders',
        null=True, blank=True,
    )
    reminder_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='other')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        pet_part = f' ({self.pet.name})' if self.pet else ''
        return f'{self.title}{pet_part} – {self.due_date.date()}'
