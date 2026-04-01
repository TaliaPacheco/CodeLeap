from django.db.models.signals import post_save
from django.dispatch import receiver

from api.models import Like, Comment, Follow, Notification, StoryReaction, StoryReply


@receiver(post_save, sender=Like)
def notificar_like(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            actor=instance.user,
            notification_type='like',
            post=instance.post,
        )


@receiver(post_save, sender=Comment)
def notificar_comment(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            actor=instance.user,
            notification_type='comment',
            post=instance.post,
        )


@receiver(post_save, sender=Follow)
def notificar_follow(sender, instance, created, **kwargs):
    if created and instance.follower != instance.following:
        Notification.objects.create(
            recipient=instance.following,
            actor=instance.follower,
            notification_type='follow',
        )


@receiver(post_save, sender=StoryReaction)
def notificar_story_reaction(sender, instance, created, **kwargs):
    if created and instance.user != instance.story.author:
        Notification.objects.create(
            recipient=instance.story.author,
            actor=instance.user,
            notification_type='story_reaction',
            story=instance.story,
        )


@receiver(post_save, sender=StoryReply)
def notificar_story_reply(sender, instance, created, **kwargs):
    if created and instance.user != instance.story.author:
        Notification.objects.create(
            recipient=instance.story.author,
            actor=instance.user,
            notification_type='story_reply',
            story=instance.story,
        )
