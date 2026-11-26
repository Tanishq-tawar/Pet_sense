from django.db import models
from django.conf import settings


class Breed(models.Model):
    """Supported dog breeds. Expandable by adding rows."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    common_conditions = models.TextField(
        blank=True,
        help_text='Common health conditions for this breed (informational only)',
    )
    average_lifespan_years = models.PositiveSmallIntegerField(null=True, blank=True)
    is_supported = models.BooleanField(default=True, help_text='Whether AI analysis supports this breed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Pet(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('U', 'Unknown')]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pets'
    )
    breed = models.ForeignKey(
        Breed, on_delete=models.SET_NULL, null=True, related_name='pets'
    )
    name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='U')
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='pets/photos/', null=True, blank=True)
    microchip_id = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.owner.email})'


class PetMedicalHistory(models.Model):
    SEVERITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]

    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='medical_history')
    condition = models.CharField(max_length=200)
    diagnosed_date = models.DateField(null=True, blank=True)
    resolved_date = models.DateField(null=True, blank=True)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    treating_vet = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    is_ongoing = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-diagnosed_date']
        verbose_name = 'Medical History Entry'
        verbose_name_plural = 'Medical History Entries'

    def __str__(self):
        return f'{self.pet.name} – {self.condition}'


class Vaccination(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine_name = models.CharField(max_length=200)
    administered_date = models.DateField()
    next_due_date = models.DateField(null=True, blank=True)
    administered_by = models.CharField(max_length=200, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-administered_date']

    def __str__(self):
        return f'{self.pet.name} – {self.vaccine_name}'


class Allergy(models.Model):
    SEVERITY_CHOICES = [('mild', 'Mild'), ('moderate', 'Moderate'), ('severe', 'Severe')]

    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField(max_length=200)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='mild')
    reaction_description = models.TextField(blank=True)
    diagnosed_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Allergy'
        verbose_name_plural = 'Allergies'

    def __str__(self):
        return f'{self.pet.name} – {self.allergen}'
