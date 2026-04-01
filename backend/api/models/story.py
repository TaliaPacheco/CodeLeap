from django.conf import settings
from django.db import models


class Story(models.Model):
    CONTENT_TYPES = [
        ('image', 'Image'),
        ('text', 'Text'),
        ('code', 'Code'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stories'
    )
    content_type = models.CharField(max_length=5, choices=CONTENT_TYPES)
    text = models.TextField(blank=True, default='')
    media = models.BinaryField(null=True, blank=True)
    code = models.TextField(blank=True, default='')
    language = models.CharField(max_length=30, blank=True, default='')
    background_color = models.CharField(max_length=7, blank=True, default='#7494EC')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class StoryView(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('story', 'user')


class StoryReaction(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('story', 'user')


class StoryReply(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
