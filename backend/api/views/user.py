from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import UserSerializer, UserUpdateSerializer

User = get_user_model()


def annotate_user_qs(qs):
    return qs.annotate(
        followers_count=Count('followers', distinct=True),
        following_count=Count('following', distinct=True),
    )


class MeView(APIView):
    def get(self, request):
        user = annotate_user_qs(User.objects.filter(pk=request.user.pk)).first()
        return Response(UserSerializer(user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = annotate_user_qs(User.objects.filter(pk=request.user.pk)).first()
        return Response(UserSerializer(user).data)


class UserProfileView(APIView):
    def get(self, request, username):
        qs = annotate_user_qs(User.objects.filter(username=username))
        user = get_object_or_404(qs)
        return Response(UserSerializer(user).data)


class UserSuggestionsView(APIView):
    def get(self, request):
        following_ids = request.user.following.values_list('following_id', flat=True)
        qs = annotate_user_qs(
            User.objects.exclude(pk=request.user.pk)
            .exclude(pk__in=following_ids)
        )[:10]
        return Response(UserSerializer(qs, many=True).data)


class FollowingListView(APIView):
    def get(self, request):
        following_ids = request.user.following.values_list('following_id', flat=True)
        qs = annotate_user_qs(User.objects.filter(pk__in=following_ids))
        return Response(UserSerializer(qs, many=True).data)
