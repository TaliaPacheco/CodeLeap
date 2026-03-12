import base64
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    followers_count = serializers.IntegerField(read_only=True, default=0)
    following_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'profile_picture',
            'bio', 'role_title', 'followers_count', 'following_count',
            'date_joined', 'updated_at',
        )

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return base64.b64encode(bytes(obj.profile_picture)).decode('utf-8')
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'bio', 'role_title', 'profile_picture')

    def update(self, instance, validated_data):
        picture_b64 = validated_data.pop('profile_picture', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if picture_b64 is not None:
            instance.profile_picture = base64.b64decode(picture_b64) if picture_b64 else None
        instance.save()
        return instance
