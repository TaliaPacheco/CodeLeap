from rest_framework import status
from .base import AuthenticatedTestCase


class FollowTests(AuthenticatedTestCase):
    def setUp(self):
        super().setUp()
        self.other = self.create_other_user()

    def test_follow_user(self):
        response = self.client.post(f'/api/users/{self.other.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_follow_user_twice(self):
        self.client.post(f'/api/users/{self.other.username}/follow/')
        response = self.client.post(f'/api/users/{self.other.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_follow_self(self):
        response = self.client.post(f'/api/users/{self.user.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unfollow_user(self):
        self.client.post(f'/api/users/{self.other.username}/follow/')
        response = self.client.delete(f'/api/users/{self.other.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unfollow_not_following(self):
        response = self.client.delete(f'/api/users/{self.other.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_follow_nonexistent_user(self):
        response = self.client.post('/api/users/ghost/follow/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_follow_updates_counts(self):
        self.client.post(f'/api/users/{self.other.username}/follow/')
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.data['following_count'], 1)
        response = self.client.get(f'/api/users/{self.other.username}/')
        self.assertEqual(response.data['followers_count'], 1)
