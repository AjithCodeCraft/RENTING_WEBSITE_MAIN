from django.urls import path
from .views import (
    add_house_owner,
    get_apartments_by_owner,
    get_house_owner_by_id,
    get_house_owner_by_ssn,
    register_user,
    login_user,
    apartment_detail,
    add_apartment_image,
    get_apartment_images,
    get_apartment_image,
    update_apartment_image,
    delete_apartment_image,
    get_house_owner,
    add_apartment,
    get_apartment_list,
    create_search_filter,
    get_user_search_filter,
    update_user_search_filter,
    delete_user_search_filter,
    get_filtered_apartments,
    send_message,
    get_all_send_messages,
    get_all_send_received_messages,
    get_all_received_messages,
    get_all_received_messages_from,
    get_all_send_messages_to,
    get_all_send_received_messages_with,
    payment_callback,
    BookingCreateView,
    PaymentInitiateView,
    generate_payment_url,\
    check_payment_status,
    total_bookings,
    bookings_by_apartment,
    bookings_by_user,
    total_payments,
    payments_by_booking,
    payments_by_apartment,
    payments_by_user,
    register_admin,
    login_admin



)

urlpatterns = [
    path("signup/", register_user, name="register_user"),  # 🔹 User Registration
    path("login/", login_user, name="login_user"),
    path("houseowner/", get_house_owner, name="get-house-owner"),
    path("add-house-owner/", add_house_owner, name="add-house-owner"),
    path(
        "apartments", get_apartment_list, name="apartment-list"
    ),  # ✅ Get all apartments
    path("apartments/add/", add_apartment, name="add-apartment"),
    path("apartments/<uuid:pk>/", apartment_detail, name="apartment-detail"),
    path(
        "api/house-owner/by-id/<str:owner_id>/",
        get_house_owner_by_id,
        name="get-house-owner-by-id",
    ),
    path(
        "api/house-owner/by-ssn/<str:ssn>/",
        get_house_owner_by_ssn,
        name="get-house-owner-by-ssn",
    ),
    path(
        "api/apartment/by-owner/<str:owner_id>/",
        get_apartments_by_owner,
        name="get_apartments_by_owner",
    ),
    path("apartment-images/add/", add_apartment_image, name="add_apartment_image"),
    path(
        "apartment-images/<uuid:apartment_id>/",
        get_apartment_images,
        name="get_apartment_images",
    ),
    path(
        "apartment-image/<uuid:image_id>/",
        get_apartment_image,
        name="get_apartment_image",
    ),
    path(
        "apartment-image/update/<uuid:image_id>/",
        update_apartment_image,
        name="update_apartment_image",
    ),
    path(
        "apartment-image/delete/<uuid:image_id>/",
        delete_apartment_image,
        name="delete_apartment_image",
    ),
    path("search_filter", get_user_search_filter, name="get_user_search_filter"),
    path("search_filter/create", create_search_filter, name="create_search_filter"),
    path(
        "search_filter/update",
        update_user_search_filter,
        name="create_user_search_filter",
    ),
    path(
        "search_filter/delete",
        delete_user_search_filter,
        name="delete_user_search_filter",
    ),
    path("apartments/filter", get_filtered_apartments, name="get_filtered_apartments"),
    path("chat/send-message/<str:receiver_id>", send_message, name="send_message"),
    path(
        "chat/get-all-send-messages",
        get_all_send_messages,
        name="get_all_send_messages",
    ),
    path(
        "chat/get-all-send-received-messages",
        get_all_send_received_messages,
        name="get_all_send_received_messages",
    ),
    path(
        "chat/get-all-received-messages",
        get_all_received_messages,
        name="get_all_received_messages",
    ),
    path(
        "chat/get-all-received-messages-from/<str:sender_id>",
        get_all_received_messages_from,
        name="get_all_received_messages_from",
    ),
    path(
        "chat/get-all-send-messages-to/<str:receiver_id>",
        get_all_send_messages_to,
        name="get_all_send_messages_to",
    ),
    path(
        "chat/get-all-send-received-messages-with/<str:other_user_id>",
        get_all_send_received_messages_with,
        name="get_all_send_received_messages_with",
    ),

    path(
        'booking/create/',
        BookingCreateView.as_view(), 
        name='create-booking'),

    path(
        'payment/initiate/<uuid:booking_id>/', 
        PaymentInitiateView.as_view(), 
        name='initiate-payment'),

    path(
        'payment/callback/',
        payment_callback,
        name='payment-callback'),

    path(
        'payment/url/', 
        generate_payment_url, 
        name='generate-payment-url'),

    path(
        "payment/status/<str:order_id>/", 
        check_payment_status, 
        name="check-payment-status"),
    path(
        'bookings/total/', 
        total_bookings, 
        name='total_bookings'),
    path(
        'bookings/apartment/<uuid:apartment_id>/', 
        bookings_by_apartment, 
        name='bookings_by_apartment'),
    path(
        'bookings/user/<int:user_id>/', 
        bookings_by_user, 
        name='bookings_by_user'),
    path(
        'payments/total/', 
        total_payments, 
        name='total_payments'),
    path(
        'payments/booking/<uuid:booking_id>/', 
        payments_by_booking, 
        name='payments_by_booking'),
    path(
        'payments/apartment/<uuid:apartment_id>/', 
        payments_by_apartment, 
        name='payments_by_apartment'),
    path(
        'payments/user/<str:user_id>/', 
        payments_by_user, 
        name='payments_by_user'),
    path(
        'api/register-admin/', 
        register_admin, 
        name='register_admin'),
    path(
        'api/login-admin/', 
        login_admin, 
        name='login_admin'),

    



    ]
