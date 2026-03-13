from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Max
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(participants=self.request.user)
            .annotate(last_activity=Max('messages__created_at'))
            .order_by('-last_activity', '-updated_at')
        )

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response({'detail': 'username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if other_user == request.user:
            return Response({'detail': 'Cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Busca conversa existente entre os dois
        conversation = (
            Conversation.objects
            .filter(participants=request.user)
            .filter(participants=other_user)
            .first()
        )

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs['pk']
        return (
            Message.objects
            .filter(conversation_id=conversation_id, conversation__participants=self.request.user)
            .order_by('-created_at')
        )


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        Message.objects.filter(
            conversation_id=pk,
            conversation__participants=request.user,
            is_read=False,
        ).exclude(sender=request.user).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
