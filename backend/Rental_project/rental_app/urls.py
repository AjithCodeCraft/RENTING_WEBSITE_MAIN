from django.urls import path
from .views import (
    add_house_owner,
    check_owner_verification,
    get_apartment_by_id,
    get_apartments_by_owner,
    get_house_owner_by_id,
    get_house_owner_by_ssn,
    get_pending_apartments_for_owner,
    register_user,
    login_user,
    apartment_detail,
    add_apartment_image,
    get_apartment_images,
    get_apartment_image,
    send_otp,
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
    generate_payment_url,
    check_payment_status,
    total_bookings,
    bookings_by_apartment,
    bookings_by_user,
    total_payments,
    payments_by_booking,
    payments_by_apartment,
    payments_by_user,
    get_payment_by_transaction_id,
    get_payment_by_payment_id,
    get_user_notifications,
    mark_notification_as_read,
    register_admin,
    login_admin,
    add_item_wishlist,
    get_wishlist,
    remove_item_wishlist_with_wishlist_id,
    remove_item_wishlist_with_apartment_id,
    get_approved_apartments,
    create_hostel_approval,
    get_pending_apartments,
    add_complaint,
    get_complaints_with_apartment_id,
    get_all_complaints,
    verify_otp,
    get_csrf_token,
    get_hostel_approval,
    delete_pending,
    approve_hostel,
    get_all_users,
    user_profile,
    update_profile
)


urlpatterns = [
    path("signup/", register_user, name="register_user"),  # 🔹 User Registration
    path("login/", login_user, name="login_user"),
    path("get-users/", get_all_users, name="get_all_users"),
    path("houseowner/", get_house_owner, name="get-house-owner"),
    path("add-house-owner/", add_house_owner, name="add-house-owner"),
    path(
        "apartments", get_apartment_list, name="apartment-list"
    ),  # ✅ Get all apartments
    path("apartments/add/", add_apartment, name="add-apartment"),
    path("apartments/<uuid:pk>/", apartment_detail, name="apartment-detail"),
    path(
        "house-owner/by-id/<str:owner_id>/",
        get_house_owner_by_id,
        name="get-house-owner-by-id",
    ),
    path(
        "house-owner/by-ssn/<str:ssn>/",
        get_house_owner_by_ssn,
        name="get-house-owner-by-ssn",
    ),
    path(
        "apartment/by-owner/<str:owner_id>/",
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
        'get-payment/transaction-id/<str:transaction_id>',
        get_payment_by_transaction_id,
        name='get_payment_by_transaction_id'
        ),
    path(
        'get-payment/payment-id/<str:payment_id>',
        get_payment_by_payment_id,
        name='get_payment_by_payment-id'
        ),
    path("get-notifications", get_user_notifications, name="get_user_notifications"),
    path("mark-notification-as-read", mark_notification_as_read, name="mark_notification_as_read"),
    path(
        'register-admin/', 
        register_admin, 
        name='register_admin'),
    path(
        'login-admin/', 
        login_admin, 
        name='login_admin'),
    path(
        'wishlist/add-item/<uuid:apartment_id>', 
        add_item_wishlist, 
        name='add_item_wishlist'),
    path(
        'wishlist/get-item', 
        get_wishlist, 
        name='get_wishlist'),
    path(
        'wishlist/delete-item/<uuid:wishlist_id>',
        remove_item_wishlist_with_wishlist_id,
        name="remove_item_wishlist_with_wishlist_id"
    ),
    path(
        'wishlist/delete-item/apartment-id/<uuid:apartment_id>',
        remove_item_wishlist_with_apartment_id,
        name="remove_item_wishlist_with_apartment_id"
    ),
    path(
        'hostel-approval/', 
        create_hostel_approval, 
        name='hostel-approval'),
    path(
        'approve-hostel/<uuid:apartment_id>', 
        approve_hostel, 
        name='approve_hostel'),
    path(
        'apartments/approved/', 
        get_approved_apartments, 
        name='paid-apartments'),
    path(
        'get-pending-apartments/', 
        get_pending_apartments, 
        name='get_pending_apartments'),
    path(
        'add_complaint/<uuid:apartment_id>',
        add_complaint,
        name="add_complaint"
    ),
    path(
        'get-complaints/apartment-id/<uuid:apartment_id>',
        get_complaints_with_apartment_id,
        name="get_complaints_with_apartment_id"
    ),
    path(
        'get-complaints',
        get_all_complaints,

        name="get_all_complaints",
    ),
    path(
        'send_otp/', 
        send_otp, 
        name='send_otp'),
    path(
        'verify_otp/', 
        verify_otp, 
        name='verify_otp'),
    path(
        'check-owner-verification/', 
        check_owner_verification, 
        name='check-owner-verification'),

    path(
        'get-complaints/',
        get_all_complaints,
        name="get_all_complaints",
        
    ),      
   
    path(
        'get-csrf-token/',
        get_csrf_token,
        name="get_csrf_token"
    ),
    path(
        'get-hostel-approval/',
        get_hostel_approval,
        name="get_hostel_approval"
    ),
    path('delete-pending/<str:owner_id>',
         delete_pending,
         name="delete_pending"
    ),
    path('pending_apartments_for_owner/',
         get_pending_apartments_for_owner,
         name = 'pending_apartments_for_owner'),

    path('user/profile/',
         user_profile,
         name ='user_profile' ),
    path('update-profile/', 
         update_profile,
        name='update_profile'),
    path('apartments_by_id/<str:apartment_id>/', get_apartment_by_id, name='get_apartment_by_id'),
]    

    



