from rest_framework import serializers
from api.models import Notification
from .user import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'notification_type', 'post', 'is_read', 'created_at']
