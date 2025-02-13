from django.urls import path
from .views import (add_house_owner, get_apartments_by_owner, get_house_owner_by_id, get_house_owner_by_ssn, register_user, login_user, apartment_detail,add_apartment_image, get_apartment_images, get_apartment_image, 
update_apartment_image, delete_apartment_image,get_house_owner,add_apartment,get_apartment_list, create_search_filter,
get_user_search_filter, update_user_search_filter, delete_user_search_filter, get_filtered_apartments)

urlpatterns = [
    path('signup/', register_user, name='register_user'),  # 🔹 User Registration
    path('login/', login_user, name='login_user'),
    path('houseowner/', get_house_owner, name='get-house-owner'),
    path('add-house-owner/', add_house_owner, name='add-house-owner'), 
    path('apartments', get_apartment_list, name='apartment-list'),  # ✅ Get all apartments
    path('apartments/add/', add_apartment, name='add-apartment'),
    path('apartments/<uuid:pk>/', apartment_detail, name='apartment-detail'),
    path('api/house-owner/by-id/<str:owner_id>/', get_house_owner_by_id, name='get-house-owner-by-id'),
    path('api/house-owner/by-ssn/<str:ssn>/', get_house_owner_by_ssn, name='get-house-owner-by-ssn'),
    path('api/apartment/by-owner/<str:owner_id>/', get_apartments_by_owner, name='get_apartments_by_owner'),
    path('apartment-images/add/', add_apartment_image, name='add_apartment_image'),
    path('apartment-images/<uuid:apartment_id>/', get_apartment_images, name='get_apartment_images'),
    path('apartment-image/<uuid:image_id>/', get_apartment_image, name='get_apartment_image'),
    path('apartment-image/update/<uuid:image_id>/', update_apartment_image, name='update_apartment_image'),
    path('apartment-image/delete/<uuid:image_id>/', delete_apartment_image, name='delete_apartment_image'),
    path("search_filter", get_user_search_filter, name="get_user_search_filter"),
    path("search_filter/create", create_search_filter, name="create_search_filter"),
    path("search_filter/update", update_user_search_filter, name="create_user_search_filter"),
    path("search_filter/delete", delete_user_search_filter, name="delete_user_search_filter"),
    path("apartments/filter", get_filtered_apartments, name="get_filtered_apartments")
]
