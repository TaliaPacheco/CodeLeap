from rest_framework import status
from api.models import Post
from .base import AuthenticatedTestCase


class CommentTests(AuthenticatedTestCase):
    def setUp(self):
        super().setUp()
        self.post = Post.objects.create(author=self.user, title='Post', content='Content')
        self.url = f'/api/posts/{self.post.pk}/comments/'

    def test_create_comment(self):
        response = self.client.post(self.url, {'content': 'Nice post!'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Nice post!')
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_create_comment_empty(self):
        response = self.client.post(self.url, {'content': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_comments(self):
        self.client.post(self.url, {'content': 'Comment 1'})
        self.client.post(self.url, {'content': 'Comment 2'})
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_comments_on_nonexistent_post(self):
        response = self.client.get('/api/posts/9999/comments/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_comment_reflects_in_post_count(self):
        self.client.post(self.url, {'content': 'A comment'})
        response = self.client.get(f'/api/posts/{self.post.pk}/')
        self.assertEqual(response.data['comments_count'], 1)
