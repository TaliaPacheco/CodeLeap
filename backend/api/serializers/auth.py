import base64
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    profile_picture = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'profile_picture')

    def create(self, validated_data):
        picture_b64 = validated_data.pop('profile_picture', None)
        user = User.objects.create_user(**validated_data)
        if picture_b64:
            user.profile_picture = base64.b64decode(picture_b64)
            user.save(update_fields=['profile_picture'])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()
