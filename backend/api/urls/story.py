# backend/api/urls/story.py
from django.urls import path
from api.views import (
    StoryListCreateView, StoryDetailView, StoryViewView,
    StoryReactView, StoryReplyView, MyStoriesView,
)

urlpatterns = [
    path('', StoryListCreateView.as_view()),
    path('me/', MyStoriesView.as_view()),
    path('<int:pk>/', StoryDetailView.as_view()),
    path('<int:pk>/view/', StoryViewView.as_view()),
    path('<int:pk>/react/', StoryReactView.as_view()),
    path('<int:pk>/reply/', StoryReplyView.as_view()),
]
