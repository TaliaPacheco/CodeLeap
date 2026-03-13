from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListCreateView.as_view()),
    path('conversations/<int:pk>/messages/', views.MessageListView.as_view()),
    path('conversations/<int:pk>/read/', views.MarkReadView.as_view()),
]
