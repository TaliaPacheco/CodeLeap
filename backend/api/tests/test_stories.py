from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from api.models import User, Story, StoryView, StoryReaction, StoryReply, Follow


class StoryTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice', email='alice@test.com', password='testpass123'
        )
        self.other = User.objects.create_user(
            username='bob', email='bob@test.com', password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_text_story(self):
        resp = self.client.post('/api/stories/', {
            'content_type': 'text',
            'text': 'Hello world!',
            'background_color': '#7494EC',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['content_type'], 'text')
        self.assertEqual(resp.data['text'], 'Hello world!')

    def test_create_code_story(self):
        resp = self.client.post('/api/stories/', {
            'content_type': 'code',
            'code': 'print("hello")',
            'language': 'python',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['language'], 'python')

    def test_list_stories_shows_followed_users(self):
        Follow.objects.create(follower=self.user, following=self.other)
        Story.objects.create(author=self.other, content_type='text', text='Bob story')
        resp = self.client.get('/api/stories/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['author']['username'], 'bob')

    def test_list_stories_hides_unfollowed_users(self):
        Story.objects.create(author=self.other, content_type='text', text='Bob story')
        resp = self.client.get('/api/stories/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 0)

    def test_list_stories_includes_own(self):
        Story.objects.create(author=self.user, content_type='text', text='My story')
        resp = self.client.get('/api/stories/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_expired_stories_not_listed(self):
        story = Story.objects.create(author=self.user, content_type='text', text='Old')
        Story.objects.filter(pk=story.pk).update(
            created_at=timezone.now() - timedelta(hours=25)
        )
        resp = self.client.get('/api/stories/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 0)

    def test_delete_own_story(self):
        story = Story.objects.create(author=self.user, content_type='text', text='Delete me')
        resp = self.client.delete(f'/api/stories/{story.pk}/')
        self.assertEqual(resp.status_code, 204)

    def test_cannot_delete_others_story(self):
        story = Story.objects.create(author=self.other, content_type='text', text='Not yours')
        resp = self.client.delete(f'/api/stories/{story.pk}/')
        self.assertEqual(resp.status_code, 403)

    def test_register_view(self):
        story = Story.objects.create(author=self.other, content_type='text', text='View me')
        resp = self.client.post(f'/api/stories/{story.pk}/view/')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(StoryView.objects.filter(story=story, user=self.user).exists())

    def test_view_is_idempotent(self):
        story = Story.objects.create(author=self.other, content_type='text', text='View me')
        self.client.post(f'/api/stories/{story.pk}/view/')
        self.client.post(f'/api/stories/{story.pk}/view/')
        self.assertEqual(StoryView.objects.filter(story=story, user=self.user).count(), 1)

    def test_react_to_story(self):
        story = Story.objects.create(author=self.other, content_type='text', text='React')
        resp = self.client.post(f'/api/stories/{story.pk}/react/', {'emoji': '\U0001f525'})
        self.assertEqual(resp.status_code, 201)

    def test_remove_reaction(self):
        story = Story.objects.create(author=self.other, content_type='text', text='React')
        StoryReaction.objects.create(story=story, user=self.user, emoji='\U0001f525')
        resp = self.client.delete(f'/api/stories/{story.pk}/react/')
        self.assertEqual(resp.status_code, 204)

    def test_reply_to_story(self):
        story = Story.objects.create(author=self.other, content_type='text', text='Reply')
        resp = self.client.post(f'/api/stories/{story.pk}/reply/', {'content': 'Nice!'})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['content'], 'Nice!')

    def test_my_stories(self):
        Story.objects.create(author=self.user, content_type='text', text='Mine')
        resp = self.client.get('/api/stories/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertIn('viewers', resp.data[0])

    def test_cleanup_command(self):
        story = Story.objects.create(author=self.user, content_type='text', text='Old')
        Story.objects.filter(pk=story.pk).update(
            created_at=timezone.now() - timedelta(hours=25)
        )
        from django.core.management import call_command
        call_command('cleanup_expired_stories')
        self.assertFalse(Story.objects.filter(pk=story.pk).exists())
