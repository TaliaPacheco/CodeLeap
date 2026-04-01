# backend/api/views/story.py
from datetime import timedelta

from django.db.models import Count, Exists, OuterRef
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Story, StoryView, StoryReaction, StoryReply, Follow
from api.serializers import (
    StorySerializer, StoryCreateSerializer, StoryReactionSerializer,
    StoryReplySerializer, MyStorySerializer,
)
from api.serializers.user import UserSerializer


def active_stories_cutoff():
    return timezone.now() - timedelta(hours=24)


def get_story_queryset(user):
    return Story.objects.filter(
        created_at__gte=active_stories_cutoff()
    ).select_related('author').annotate(
        views_count=Count('views', distinct=True),
        is_viewed=Exists(StoryView.objects.filter(story=OuterRef('pk'), user=user)),
    )


class StoryListCreateView(APIView):
    def get(self, request):
        following_ids = Follow.objects.filter(
            follower=request.user
        ).values_list('following_id', flat=True)

        author_ids = list(following_ids) + [request.user.id]

        qs = get_story_queryset(request.user).filter(
            author_id__in=author_ids
        ).order_by('author_id', '-created_at')

        # Group by author
        grouped = {}
        for story in qs:
            aid = story.author.id
            if aid not in grouped:
                grouped[aid] = {
                    'author': story.author,
                    'stories': [],
                    'has_unseen': False,
                    'latest': story.created_at,
                }
            grouped[aid]['stories'].append(story)
            if not story.is_viewed:
                grouped[aid]['has_unseen'] = True

        # Sort: current user first, then unseen first, then by latest story
        authors = sorted(
            grouped.values(),
            key=lambda g: (
                g['author'].id != request.user.id,
                not g['has_unseen'],
                -g['latest'].timestamp(),
            ),
        )

        result = []
        for group in authors:
            result.append({
                'author': UserSerializer(group['author']).data,
                'has_unseen': group['has_unseen'],
                'stories': StorySerializer(group['stories'], many=True).data,
            })

        return Response(result)

    def post(self, request):
        serializer = StoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        story = serializer.save(author=request.user)
        output = get_story_queryset(request.user).get(pk=story.pk)
        return Response(StorySerializer(output).data, status=status.HTTP_201_CREATED)


class StoryDetailView(APIView):
    def delete(self, request, pk):
        story = get_object_or_404(
            Story.objects.filter(created_at__gte=active_stories_cutoff()),
            pk=pk,
        )
        if story.author != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        story.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StoryViewView(APIView):
    def post(self, request, pk):
        story = get_object_or_404(
            Story.objects.filter(created_at__gte=active_stories_cutoff()),
            pk=pk,
        )
        StoryView.objects.get_or_create(story=story, user=request.user)
        return Response(status=status.HTTP_201_CREATED)


class StoryReactView(APIView):
    def post(self, request, pk):
        story = get_object_or_404(
            Story.objects.filter(created_at__gte=active_stories_cutoff()),
            pk=pk,
        )
        serializer = StoryReactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        _, created = StoryReaction.objects.get_or_create(
            story=story,
            user=request.user,
            defaults={'emoji': serializer.validated_data['emoji']},
        )
        if not created:
            return Response({'detail': 'Already reacted.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        story = get_object_or_404(
            Story.objects.filter(created_at__gte=active_stories_cutoff()),
            pk=pk,
        )
        deleted, _ = StoryReaction.objects.filter(story=story, user=request.user).delete()
        if not deleted:
            return Response({'detail': 'No reaction.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StoryReplyView(APIView):
    def post(self, request, pk):
        story = get_object_or_404(
            Story.objects.filter(created_at__gte=active_stories_cutoff()),
            pk=pk,
        )
        serializer = StoryReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reply = StoryReply.objects.create(
            story=story,
            user=request.user,
            content=serializer.validated_data['content'],
        )
        return Response(
            StoryReplySerializer(reply).data,
            status=status.HTTP_201_CREATED,
        )


class MyStoriesView(APIView):
    def get(self, request):
        qs = get_story_queryset(request.user).filter(author=request.user)
        return Response(MyStorySerializer(qs, many=True).data)
