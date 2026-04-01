from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPES = [
        ('follow', 'Follow'),
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('story_reaction', 'Story Reaction'),
        ('story_reply', 'Story Reply'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+'
    )
    notification_type = models.CharField(max_length=20, choices=TYPES)
    post = models.ForeignKey(
        'Post', on_delete=models.CASCADE, null=True, blank=True
    )
    story = models.ForeignKey(
        'Story', on_delete=models.CASCADE, null=True, blank=True
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
