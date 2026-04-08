from rest_framework import status
from .base import AuthenticatedTestCase


class MeTests(AuthenticatedTestCase):
    def test_get_me(self):
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@codeleap.com')
        self.assertIn('followers_count', response.data)
        self.assertIn('following_count', response.data)

    def test_update_me(self):
        response = self.client.patch('/api/users/me/', {
            'bio': 'Hello world',
            'role_title': 'Backend Dev',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Hello world')
        self.assertEqual(response.data['role_title'], 'Backend Dev')

    def test_update_username(self):
        response = self.client.patch('/api/users/me/', {'username': 'newname'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'newname')

    def test_unauthenticated(self):
        self.client.credentials()
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserProfileTests(AuthenticatedTestCase):
    def test_get_profile(self):
        other = self.create_other_user()
        response = self.client.get(f'/api/users/{other.username}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'other')

    def test_get_nonexistent_profile(self):
        response = self.client.get('/api/users/ghost/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UserSuggestionsTests(AuthenticatedTestCase):
    def test_suggestions_excludes_self(self):
        self.create_other_user()
        response = self.client.get('/api/users/suggestions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [u['username'] for u in response.data['results']]
        self.assertNotIn('testuser', usernames)
        self.assertIn('other', usernames)

    def test_suggestions_excludes_already_following(self):
        other = self.create_other_user()
        from api.models import Follow
        Follow.objects.create(follower=self.user, following=other)
        third = self.create_other_user(username='third', email='third@codeleap.com')
        response = self.client.get('/api/users/suggestions/')
        usernames = [u['username'] for u in response.data['results']]
        self.assertNotIn('other', usernames)
        self.assertIn('third', usernames)
