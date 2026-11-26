from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    """CRUD for reminders. Users see only their own."""
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Reminder.objects.filter(user=self.request.user).select_related('pet')
        pet_id = self.request.query_params.get('pet')
        # Accept both 'completed' and 'is_completed' for frontend compatibility
        completed = self.request.query_params.get('completed') or self.request.query_params.get('is_completed')
        if pet_id:
            qs = qs.filter(pet_id=pet_id)
        if completed is not None:
            qs = qs.filter(is_complete=completed.lower() == 'true')
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        # Accept both is_complete and is_completed for frontend compatibility
        is_complete_val = serializer.validated_data.get('is_complete')
        if is_complete_val and not instance.is_complete:
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()
