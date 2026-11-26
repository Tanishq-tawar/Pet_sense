"""
Management command to seed initial breed data.
Run with: python manage.py seed_breeds
"""
from django.core.management.base import BaseCommand
from apps.pets.models import Breed


BREEDS = [
    {
        'name': 'Labrador Retriever',
        'slug': 'labrador-retriever',
        'description': (
            'The Labrador Retriever is one of the most popular dog breeds, '
            'known for its friendly temperament, intelligence, and versatility. '
            'Originally bred as a working retriever, Labs make excellent family pets, '
            'service dogs, and search-and-rescue animals.'
        ),
        'common_conditions': (
            'Hip and elbow dysplasia, obesity, ear infections (otitis externa), '
            'exercise-induced collapse (EIC), progressive retinal atrophy (PRA), '
            'centronuclear myopathy'
        ),
        'average_lifespan_years': 12,
        'is_supported': True,
    },
    {
        'name': 'German Shepherd',
        'slug': 'german-shepherd',
        'description': (
            'The German Shepherd is an intelligent, versatile working breed '
            'widely used in police, military, and service roles. '
            'They are loyal, confident, and highly trainable, making them '
            'excellent family dogs and working animals.'
        ),
        'common_conditions': (
            'Hip and elbow dysplasia, degenerative myelopathy, bloat (GDV), '
            'skin conditions (pyoderma, hot spots), exocrine pancreatic insufficiency (EPI), '
            'perianal fistulas'
        ),
        'average_lifespan_years': 11,
        'is_supported': True,
    },
]


class Command(BaseCommand):
    help = 'Seed initial breed data for Pet Sense'

    def handle(self, *args, **options):
        created = 0
        for breed_data in BREEDS:
            obj, was_created = Breed.objects.update_or_create(
                slug=breed_data['slug'],
                defaults=breed_data,
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f'  Created breed: {obj.name}'))
            else:
                self.stdout.write(f'  Updated breed: {obj.name}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Breeds seeded. Created: {created}, Total: {Breed.objects.count()}'
        ))
