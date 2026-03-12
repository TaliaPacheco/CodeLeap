from django.urls import path
from api.views import PostListCreateView, PostDetailView, PostLikeView, PostCommentsView, CommentDetailView

urlpatterns = [
    path('', PostListCreateView.as_view()),
    path('<int:pk>/', PostDetailView.as_view()),
    path('<int:pk>/like/', PostLikeView.as_view()),
    path('<int:pk>/comments/', PostCommentsView.as_view()),
    path('comments/<int:pk>/', CommentDetailView.as_view()),
]
