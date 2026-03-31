from django.db.models import Count, Exists, OuterRef
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Post, Like
from api.permissions import IsAuthorOrReadOnly
from api.serializers import PostSerializer, PostCreateSerializer, PostUpdateSerializer


def get_post_queryset(user):
    return Post.objects.select_related('author').annotate(
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True),
        is_liked=Exists(Like.objects.filter(post=OuterRef('pk'), user=user)),
    )


class PostListCreateView(APIView):
    def get(self, request):
        qs = get_post_queryset(request.user)

        author = request.query_params.get('author')
        if author == 'me':
            qs = qs.filter(author=request.user)

        liked = request.query_params.get('liked')
        if liked == 'true':
            qs = qs.filter(likes__user=request.user)

        sort = request.query_params.get('sort', 'recent')
        if sort == 'trending':
            qs = qs.order_by('-likes_count', '-created_at')
        else:
            qs = qs.order_by('-created_at')

        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = PostSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = PostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        output = get_post_queryset(request.user).get(pk=post.pk)
        return Response(PostSerializer(output).data, status=status.HTTP_201_CREATED)


class PostDetailView(APIView):
    permission_classes = [IsAuthorOrReadOnly]

    def get_object(self, pk, user):
        post = get_object_or_404(get_post_queryset(user), pk=pk)
        self.check_object_permissions(self.request, post)
        return post

    def get(self, request, pk):
        post = get_object_or_404(get_post_queryset(request.user), pk=pk)
        return Response(PostSerializer(post).data)

    def patch(self, request, pk):
        post = self.get_object(pk, request.user)
        serializer = PostUpdateSerializer(post, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        output = get_post_queryset(request.user).get(pk=pk)
        return Response(PostSerializer(output).data)

    def delete(self, request, pk):
        post = self.get_object(pk, request.user)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostLikeView(APIView):
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        _, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            return Response({'detail': 'Already liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        deleted, _ = Like.objects.filter(user=request.user, post=post).delete()
        if not deleted:
            return Response({'detail': 'Not liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)
