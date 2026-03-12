from rest_framework import status
from api.models import Post
from .base import AuthenticatedTestCase


class PostListCreateTests(AuthenticatedTestCase):
    def test_create_post(self):
        response = self.client.post('/api/posts/', {
            'title': 'Hello world',
            'content': 'My first post!',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Hello world')
        self.assertEqual(response.data['author']['username'], 'testuser')
        self.assertEqual(response.data['likes_count'], 0)
        self.assertEqual(response.data['comments_count'], 0)
        self.assertFalse(response.data['is_liked'])

    def test_create_post_missing_title(self):
        response = self.client.post('/api/posts/', {'content': 'No title'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_posts(self):
        Post.objects.create(author=self.user, title='Post 1', content='Content 1')
        Post.objects.create(author=self.user, title='Post 2', content='Content 2')
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_posts_sorted_recent(self):
        Post.objects.create(author=self.user, title='Old', content='old')
        Post.objects.create(author=self.user, title='New', content='new')
        response = self.client.get('/api/posts/?sort=recent')
        self.assertEqual(response.data['results'][0]['title'], 'New')

    def test_filter_my_posts(self):
        Post.objects.create(author=self.user, title='Mine', content='mine')
        other = self.create_other_user()
        Post.objects.create(author=other, title='Theirs', content='theirs')
        response = self.client.get('/api/posts/?author=me')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Mine')


class PostDetailTests(AuthenticatedTestCase):
    def setUp(self):
        super().setUp()
        self.post = Post.objects.create(author=self.user, title='Test', content='Content')

    def test_get_post(self):
        response = self.client.get(f'/api/posts/{self.post.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test')

    def test_get_nonexistent_post(self):
        response = self.client.get('/api/posts/9999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_own_post(self):
        response = self.client.patch(f'/api/posts/{self.post.pk}/', {'title': 'Updated'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated')

    def test_update_others_post(self):
        other = self.create_other_user()
        other_post = Post.objects.create(author=other, title='Other', content='nope')
        response = self.client.patch(f'/api/posts/{other_post.pk}/', {'title': 'Hacked'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_own_post(self):
        response = self.client.delete(f'/api/posts/{self.post.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(pk=self.post.pk).exists())

    def test_delete_others_post(self):
        other = self.create_other_user()
        other_post = Post.objects.create(author=other, title='Other', content='nope')
        response = self.client.delete(f'/api/posts/{other_post.pk}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PostLikeTests(AuthenticatedTestCase):
    def setUp(self):
        super().setUp()
        self.post = Post.objects.create(author=self.user, title='Likeable', content='Like me')

    def test_like_post(self):
        response = self.client.post(f'/api/posts/{self.post.pk}/like/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_like_post_twice(self):
        self.client.post(f'/api/posts/{self.post.pk}/like/')
        response = self.client.post(f'/api/posts/{self.post.pk}/like/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unlike_post(self):
        self.client.post(f'/api/posts/{self.post.pk}/like/')
        response = self.client.delete(f'/api/posts/{self.post.pk}/like/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unlike_not_liked(self):
        response = self.client.delete(f'/api/posts/{self.post.pk}/like/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_like_reflects_in_post(self):
        self.client.post(f'/api/posts/{self.post.pk}/like/')
        response = self.client.get(f'/api/posts/{self.post.pk}/')
        self.assertEqual(response.data['likes_count'], 1)
        self.assertTrue(response.data['is_liked'])
