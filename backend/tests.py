"""
Pet Sense Backend Test Suite
Tests for auth, pets, uploads, analysis, reminders, and authorization.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.pets.models import Breed, Pet
from apps.reminders.models import Reminder
from datetime import datetime, timezone, timedelta
import json

User = get_user_model()


def create_user(email='test@example.com', password='testpass123', username='testuser'):
    return User.objects.create_user(email=email, username=username, password=password)


def get_tokens(client, email, password):
    res = client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
    return res.data.get('access'), res.data.get('refresh')


class AuthTests(APITestCase):
    def test_register_success(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'securepass123',
            'password2': 'securepass123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_register_password_mismatch(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'x@example.com', 'username': 'x',
            'password': 'pass1', 'password2': 'pass2',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        create_user()
        res = self.client.post('/api/auth/register/', {
            'email': 'test@example.com', 'username': 'other',
            'password': 'testpass123', 'password2': 'testpass123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        create_user()
        res = self.client.post('/api/auth/login/', {
            'email': 'test@example.com', 'password': 'testpass123'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('user', res.data)

    def test_login_wrong_password(self):
        create_user()
        res = self.client.post('/api/auth/login/', {
            'email': 'test@example.com', 'password': 'wrongpass'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_requires_auth(self):
        res = self.client.get('/api/auth/profile/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        create_user()
        access, _ = get_tokens(self.client, 'test@example.com', 'testpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        res = self.client.get('/api/auth/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'test@example.com')


class PetTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.other_user = create_user('other@example.com', 'pass123', 'otheruser')
        access, _ = get_tokens(self.client, 'test@example.com', 'testpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        self.breed = Breed.objects.create(name='Labrador Retriever', slug='labrador-retriever')

    def test_create_pet(self):
        res = self.client.post('/api/pets/', {
            'name': 'Buddy',
            'breed': self.breed.pk,
            'gender': 'M',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Buddy')

    def test_list_pets_own_only(self):
        Pet.objects.create(owner=self.user, breed=self.breed, name='Mine')
        Pet.objects.create(owner=self.other_user, breed=self.breed, name='Theirs')
        res = self.client.get('/api/pets/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in res.data['results']]
        self.assertIn('Mine', names)
        self.assertNotIn('Theirs', names)

    def test_update_pet(self):
        pet = Pet.objects.create(owner=self.user, breed=self.breed, name='Old')
        res = self.client.patch(f'/api/pets/{pet.pk}/', {'name': 'New'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'New')

    def test_delete_pet(self):
        pet = Pet.objects.create(owner=self.user, breed=self.breed, name='ToDelete')
        res = self.client.delete(f'/api/pets/{pet.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_cannot_access_other_user_pet(self):
        other_pet = Pet.objects.create(owner=self.other_user, breed=self.breed, name='Private')
        res = self.client.get(f'/api/pets/{other_pet.pk}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_pet_requires_auth(self):
        self.client.credentials()
        res = self.client.get('/api/pets/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class UploadValidationTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        access, _ = get_tokens(self.client, 'test@example.com', 'testpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        self.breed = Breed.objects.create(name='German Shepherd', slug='german-shepherd')
        self.pet = Pet.objects.create(owner=self.user, breed=self.breed, name='Max')

    def test_reject_invalid_file_type(self):
        bad_file = SimpleUploadedFile('test.txt', b'hello', content_type='text/plain')
        res = self.client.post('/api/uploads/', {
            'pet': self.pet.pk,
            'file': bad_file,
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_other_user_pet(self):
        other_user = create_user('o@e.com', 'pass', 'ousr')
        other_pet = Pet.objects.create(owner=other_user, breed=self.breed, name='OtherPet')
        img = SimpleUploadedFile('test.jpg', b'\xff\xd8\xff\xe0' + b'\x00' * 100, content_type='image/jpeg')
        res = self.client.post('/api/uploads/', {
            'pet': other_pet.pk,
            'file': img,
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class ReminderTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.other_user = create_user('o@e.com', 'pass', 'ousr')
        access, _ = get_tokens(self.client, 'test@example.com', 'testpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

    def test_create_reminder(self):
        due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        res = self.client.post('/api/reminders/', {
            'title': 'Vet checkup',
            'reminder_type': 'vet_checkup',
            'due_date': due,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_list_own_reminders_only(self):
        due = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        Reminder.objects.create(user=self.user, title='Mine', due_date=due, reminder_type='other')
        Reminder.objects.create(user=self.other_user, title='Theirs', due_date=due, reminder_type='other')
        res = self.client.get('/api/reminders/')
        titles = [r['title'] for r in res.data['results']]
        self.assertIn('Mine', titles)
        self.assertNotIn('Theirs', titles)
