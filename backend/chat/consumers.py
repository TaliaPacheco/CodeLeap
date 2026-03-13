from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close(code=4001)
            return

        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.group_name = f'chat_{self.conversation_id}'

        is_participant = await self.check_participant()
        if not is_participant:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        text = content.get('content', '').strip()
        if not text:
            return

        message = await self.save_message(text)

        await self.channel_layer.group_send(self.group_name, {
            'type': 'chat.message',
            'message': {
                'id': message['id'],
                'sender': message['sender'],
                'content': message['content'],
                'created_at': message['created_at'],
            },
        })

    async def chat_message(self, event):
        await self.send_json(event['message'])

    @database_sync_to_async
    def check_participant(self):
        return Conversation.objects.filter(
            id=self.conversation_id,
            participants=self.user,
        ).exists()

    @database_sync_to_async
    def save_message(self, text):
        import base64
        conversation = Conversation.objects.get(id=self.conversation_id)
        msg = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=text,
        )
        conversation.save()  # atualiza updated_at

        profile_picture = None
        if self.user.profile_picture:
            profile_picture = base64.b64encode(bytes(self.user.profile_picture)).decode('utf-8')

        return {
            'id': msg.id,
            'sender': {
                'id': self.user.id,
                'username': self.user.username,
                'profile_picture': profile_picture,
            },
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
        }
