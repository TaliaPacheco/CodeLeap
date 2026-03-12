from django.urls import path
from api.views import MeView, UserProfileView, UserSuggestionsView, FollowingListView, FollowView

urlpatterns = [
    path('me/', MeView.as_view()),
    path('suggestions/', UserSuggestionsView.as_view()),
    path('following/', FollowingListView.as_view()),
    path('<str:username>/', UserProfileView.as_view()),
    path('<str:username>/follow/', FollowView.as_view()),
]
