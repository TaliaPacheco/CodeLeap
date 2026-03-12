from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.urls.auth')),
    path('users/', include('api.urls.user')),
    path('posts/', include('api.urls.post')),
]
