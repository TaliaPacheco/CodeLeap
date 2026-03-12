from django.urls import path
from api.views import NotificationListView, NotificationReadAllView, NotificationUnreadCountView

urlpatterns = [
    path('', NotificationListView.as_view()),
    path('read-all/', NotificationReadAllView.as_view()),
    path('unread-count/', NotificationUnreadCountView.as_view()),
]
