from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Notification
from api.serializers import NotificationSerializer


class NotificationListView(APIView):
    def get(self, request):
        qs = request.user.notifications.select_related('actor')[:50]
        return Response(NotificationSerializer(qs, many=True).data)


class NotificationReadAllView(APIView):
    def patch(self, request):
        request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationUnreadCountView(APIView):
    def get(self, request):
        count = request.user.notifications.filter(is_read=False).count()
        return Response({'count': count})
