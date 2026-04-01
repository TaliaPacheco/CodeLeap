from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.urls.auth')),
    path('users/', include('api.urls.user')),
    path('posts/', include('api.urls.post')),
    path('notifications/', include('api.urls.notification')),
    path('stories/', include('api.urls.story')),
]
