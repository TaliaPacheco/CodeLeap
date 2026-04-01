# backend/api/serializers/story.py
import base64
from rest_framework import serializers
from api.models import Story, StoryReaction, StoryReply
from .user import UserSerializer


class StorySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    views_count = serializers.IntegerField(read_only=True, default=0)
    is_viewed = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Story
        fields = (
            'id', 'author', 'content_type', 'text', 'media',
            'code', 'language', 'background_color',
            'views_count', 'is_viewed', 'created_at',
        )

    def get_media(self, obj):
        if obj.media:
            return base64.b64encode(bytes(obj.media)).decode('utf-8')
        return None


class StoryCreateSerializer(serializers.ModelSerializer):
    media = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Story
        fields = ('content_type', 'text', 'media', 'code', 'language', 'background_color')

    def create(self, validated_data):
        media_b64 = validated_data.pop('media', None)
        story = Story(**validated_data)
        if media_b64:
            story.media = base64.b64decode(media_b64)
        story.save()
        return story


class StoryReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryReaction
        fields = ('emoji',)


class StoryReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StoryReply
        fields = ('id', 'user', 'content', 'created_at')


class MyStorySerializer(StorySerializer):
    """Extended serializer for author's own stories — includes viewer list."""
    viewers = serializers.SerializerMethodField()

    class Meta(StorySerializer.Meta):
        fields = StorySerializer.Meta.fields + ('viewers',)

    def get_viewers(self, obj):
        views = obj.views.select_related('user').all()
        return [
            {'username': v.user.username, 'profile_picture': None, 'viewed_at': v.viewed_at}
            for v in views
        ]
