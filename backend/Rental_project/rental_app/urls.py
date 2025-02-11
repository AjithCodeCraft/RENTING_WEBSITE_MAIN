from django.urls import path
from .views import add_house_owner, register_user, login_user,apartment_list_create, apartment_detail

urlpatterns = [
    path('signup/', register_user, name='register_user'),  # 🔹 User Registration
    path('login/', login_user, name='login_user'),
    path('add-house-owner/', add_house_owner, name='add-house-owner'),
    path('apartments/', apartment_list_create, name='apartment-list-create'),  # List & Create
    path('apartments/<uuid:pk>/', apartment_detail, name='apartment-detail'),
]
