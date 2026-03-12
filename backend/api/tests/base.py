from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AuthenticatedTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@codeleap.com',
            password='testpass123',
            role_title='Developer',
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def create_other_user(self, username='other', email='other@codeleap.com'):
        return User.objects.create_user(
            username=username,
            email=email,
            password='testpass123',
        )
