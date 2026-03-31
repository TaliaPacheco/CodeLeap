from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Post, Comment
from api.serializers import CommentSerializer


class PostCommentsView(APIView):
    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        comments = post.comments.select_related('user').all()
        return Response(CommentSerializer(comments, many=True).data)

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = Comment.objects.create(
            user=request.user,
            post=post,
            content=serializer.validated_data['content'],
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class CommentDetailView(APIView):
    def patch(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        if comment.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        content = request.data.get('content')
        if content:
            comment.content = content
            comment.save()
        return Response(CommentSerializer(comment).data)

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        if comment.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
