import base64
from rest_framework import serializers
from api.models import Post
from .user import UserSerializer


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True, default=0)
    comments_count = serializers.IntegerField(read_only=True, default=0)
    is_liked = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'title', 'content', 'media',
            'likes_count', 'comments_count', 'is_liked',
            'created_at', 'updated_at',
        )

    def get_media(self, obj):
        if obj.media:
            return base64.b64encode(bytes(obj.media)).decode('utf-8')
        return None


class PostCreateSerializer(serializers.ModelSerializer):
    media = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Post
        fields = ('title', 'content', 'media')

    def create(self, validated_data):
        media_b64 = validated_data.pop('media', None)
        post = Post(**validated_data)
        if media_b64:
            post.media = base64.b64decode(media_b64)
        post.save()
        return post


class PostUpdateSerializer(serializers.ModelSerializer):
    media = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Post
        fields = ('title', 'content', 'media')

    def update(self, instance, validated_data):
        media_b64 = validated_data.pop('media', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if media_b64 is not None:
            instance.media = base64.b64decode(media_b64) if media_b64 else None
        instance.save()
        return instance
