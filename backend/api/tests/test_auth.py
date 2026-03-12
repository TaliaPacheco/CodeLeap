from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterTests(APITestCase):
    url = '/api/auth/register/'

    def test_register_success(self):
        data = {'username': 'newuser', 'email': 'new@codeleap.com', 'password': 'pass12345'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_duplicate_email(self):
        User.objects.create_user(username='existing', email='dup@codeleap.com', password='pass12345')
        data = {'username': 'another', 'email': 'dup@codeleap.com', 'password': 'pass12345'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        User.objects.create_user(username='taken', email='a@codeleap.com', password='pass12345')
        data = {'username': 'taken', 'email': 'b@codeleap.com', 'password': 'pass12345'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password(self):
        data = {'username': 'user', 'email': 'u@codeleap.com', 'password': '123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    url = '/api/auth/login/'

    def setUp(self):
        self.user = User.objects.create_user(
            username='loginuser', email='login@codeleap.com', password='pass12345',
        )

    def test_login_with_email(self):
        response = self.client.post(self.url, {'email': 'login@codeleap.com', 'password': 'pass12345'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_with_username(self):
        response = self.client.post(self.url, {'email': 'loginuser', 'password': 'pass12345'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {'email': 'login@codeleap.com', 'password': 'wrong'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        response = self.client.post(self.url, {'email': 'nobody@codeleap.com', 'password': 'pass12345'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTests(APITestCase):
    url = '/api/auth/logout/'

    def setUp(self):
        self.user = User.objects.create_user(
            username='logoutuser', email='logout@codeleap.com', password='pass12345',
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        self.tokens = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.tokens.access_token}')

    def test_logout(self):
        response = self.client.post(self.url, {'refresh': str(self.tokens)})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
