from rest_framework import serializers
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True, allow_null=True)
    reminder_type_display = serializers.CharField(source='get_reminder_type_display', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    # Expose 'notes' as an alias for 'description' for frontend compatibility
    notes = serializers.CharField(source='description', required=False, allow_blank=True, default='')
    # Expose 'is_completed' as an alias for 'is_complete' for frontend compatibility
    is_completed = serializers.BooleanField(source='is_complete', required=False, default=False)

    class Meta:
        model = Reminder
        fields = [
            'id', 'pet', 'pet_name', 'reminder_type', 'reminder_type_display',
            'title', 'description', 'notes', 'due_date',
            'is_complete', 'is_completed', 'completed_at',
            'is_overdue', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']

    def get_is_overdue(self, obj):
        from django.utils import timezone
        return not obj.is_complete and obj.due_date < timezone.now()

    def validate_pet(self, pet):
        if pet and pet.owner != self.context['request'].user:
            raise serializers.ValidationError('You do not own this pet.')
        return pet
