from rest_framework import serializers
from api.models import Comment
from .user import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at')
