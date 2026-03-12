from rest_framework import serializers
from .user import UserSerializer


class FollowSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)
