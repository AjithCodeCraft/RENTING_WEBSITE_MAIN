from django.urls import path
from .views import register_user, login_user

urlpatterns = [
    path('signup/', register_user, name='register_user'),  # 🔹 User Registration
    path('login/', login_user, name='login_user'),  # 🔹 User Login
]
