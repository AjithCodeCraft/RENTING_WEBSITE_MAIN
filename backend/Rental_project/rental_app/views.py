import base64
import random
from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from rest_framework.views import APIView
import os
from gridfs import GridFS
import jwt
from django.core.mail import send_mail
import json
from bson import ObjectId  # If using MongoDB
import uuid  # Import UUID
import razorpay
from pymongo import MongoClient
import datetime
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from .authentication import AdminAuthentication
from django.conf import settings
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from gradio_client import Client
import logging
from time import sleep
from .models import (
    HostelApproval,
    HouseOwner,
    OTPVerification,
    User,
    Apartment,
    ApartmentImage,
    SearchFilter,
    Chat,
    Booking,
    Payment,
    Notification,
    Admin,
    Wishlist,
    Complaint,
)
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password, check_password
from decimal import Decimal,InvalidOperation
from bson.decimal128 import Decimal128
from django.db.models import Q

from django.middleware.csrf import get_token
from django.core.cache import cache
from django.contrib.auth import get_user_model
import requests
from django.db.models import Sum
from .serializers import (
    ApartmentSerializer,
    BookingSerializerReadOnly,
    CheckOwnerVerificationSerializer,
    HouseOwnerSerializer,
    OwnerPaymentDetailsSerializer,
    PaymentSerializerReadOnly,
    UserSerializer,
    ApartmentImageSerializer,
    SearchFilterSerializer,
    ChatSerializer,
    BookingSerializer,
    PaymentSerializer,
    NotificationSerializer,
    WishlistSerializer,
    HostelApprovalSerializer,
    ComplaintSerializer,
    ApartmentOwnerSerializer,
)


SECRET_KEY = settings.SECRET_KEY


@api_view(["POST"])
def send_otp(request):
    email = request.data.get("email")

    # Validate required fields
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists in MongoDB"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Generate a 6-digit OTP
    otp = random.randint(100000, 999999)

    # Store OTP in MongoDB (Temporary Storage)
    OTPVerification.objects.update_or_create(
        email=email,
        defaults={
            "otp": otp,
            "created_at": timezone.now(),
        },  # Use timezone-aware timestamp
    )

    # Send OTP via email
    try:
        send_mail(
            subject="Your OTP for Registration",
            message=f"Your OTP is: {otp}. It is valid for 5 minutes.",
            from_email="alameena068@gmail.com",
            recipient_list=[email],
        )

        return Response(
            {"message": "OTP sent. Verify OTP to complete registration."},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": f"Error sending OTP email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response(
            {"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check if OTP is valid
    try:
        otp_entry = OTPVerification.objects.get(email=email)
        otp_created_time = otp_entry.created_at  # Already timezone-aware
        current_time = timezone.now()  # Ensure timezone awareness

        # Check OTP expiry (valid for 5 minutes)
        if (current_time - otp_created_time).total_seconds() > 300:
            return Response(
                {"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check OTP correctness
        if otp_entry.otp != int(otp):
            return Response(
                {"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "OTP verified successfully"}, status=status.HTTP_200_OK
        )

    except OTPVerification.DoesNotExist:
        return Response(
            {"error": "OTP not found or already used"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
def register_user(request):
    email = request.data.get("email")
    password = request.data.get("password_hash")
    name = request.data.get("name")
    phone = request.data.get("phone")
    user_type = request.data.get("user_type", "seeker")

    if not email or not password or not phone:
        return Response(
            {"error": "Email, password, and phone are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if email already exists in Firebase
    try:
        auth.get_user_by_email(email)
        return Response(
            {"error": "Email already exists in Firebase"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except auth.UserNotFoundError:
        pass

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists in MongoDB"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Create user in Firebase
        new_user = auth.create_user(email=email, password=password, email_verified=True)

        # Update user profile to include phone number
        auth.update_user(new_user.uid, phone_number=phone)

        # Store user details in MongoDB
        user = User.objects.create(
            user_id=new_user.uid,
            email=email,
            phone=phone,
            name=name,
            user_type=user_type,
            password_hash=make_password(password),
        )

        return Response(
            {"message": "User created successfully", "user_id": new_user.uid},
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password_hash")

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Verify user with Firebase Authentication
        firebase_user = auth.get_user_by_email(email)

        # Firebase does not store passwords, so we need to sign in using Firebase REST API

        firebase_api_key = "AIzaSyAihvpMjjiwUtWpsr5OP0YhoI96sujJNEo"  # Replace with your Firebase API Key
        firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"

        payload = {"email": email, "password": password, "returnSecureToken": True}

        response = requests.post(firebase_auth_url, json=payload)
        firebase_data = response.json()

        if "error" in firebase_data:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check if the user exists in the Django database
        user = User.objects.get(email=email)

        # If the stored password is different, update it
        if not check_password(password, user.password):
            user.password = make_password(password)
            user.save()

        # Generate JWT token
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": user.id,
                "user_id": user.user_id,
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type,
            },
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED
        )

    except Exception as e:
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
# @permission_classes([IsAuthenticated])  # Ensure authentication
def get_house_owner(request):
    user = request.user  # Get authenticated user

    if user.user_type != "owner":
        return Response(
            {"error": "User is not a house owner"}, status=status.HTTP_403_FORBIDDEN
        )
    house_owner = get_object_or_404(HouseOwner, owner=user)
    serializer = HouseOwnerSerializer(house_owner)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])  # Ensure authentication
def add_house_owner(request):
    ssn = request.data.get("SSN")  # Get SSN

    if not ssn:
        return Response(
            {"error": "SSN is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user  # Get authenticated user directly

    if user.user_type != "owner":
        return Response(
            {"error": "User is not a house owner"}, status=status.HTTP_403_FORBIDDEN
        )

    # Prevent duplicate entries
    if HouseOwner.objects.filter(owner=user).exists():
        return Response(
            {"error": "House owner record already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Serialize and save HouseOwner
    serializer = HouseOwnerSerializer(data={"owner": user.id, "SSN": ssn})
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "House owner record created successfully"},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_apartment_list(request):
    apartments = Apartment.objects.all()
    serializer = ApartmentSerializer(apartments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can post
def add_apartment(request):
    user = request.user

    if not hasattr(user, "houseowner"):
        return Response(
            {"error": "Only house owners can add apartments"},
            status=status.HTTP_403_FORBIDDEN,
        )

    request.data["owner"] = user.houseowner.owner  # Assign authenticated house owner

    serializer = ApartmentSerializer(data=request.data)
    if serializer.is_valid():
        apartment = serializer.save()  # Save the apartment

        # Create a HostelApproval record with 'pending' status for this apartment
        HostelApproval.objects.create(
            apartment=apartment,
            admin=None,  # Initially, no admin assigned
            status="pending",  # Set the status to 'pending'
            comments="Approval pending.",  # You can add default comments or leave it blank
        )

        return Response(
            {"message": "Apartment added successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_apartment_by_id(request, apartment_id):
    try:
        apartment = Apartment.objects.get(apartment_id=apartment_id)
        serializer = ApartmentSerializer(apartment)
        return Response(serializer.data)
    except Apartment.DoesNotExist:
        return Response({"error": "Apartment not found"}, status=404)


@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([TokenAuthentication, AdminAuthentication])
def apartment_detail(request, pk):
    """Handles GET (Retrieve), PUT (Update), and DELETE for a specific Apartment."""

    try:
        apartment = Apartment.objects.get(apartment_id=pk)
    except Apartment.DoesNotExist:
        return Response(
            {"error": "Apartment not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = ApartmentSerializer(apartment)
        return Response(serializer.data)

    if request.method == "PUT":
        serializer = ApartmentSerializer(apartment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        apartment.delete()
        return Response(
            {"message": "Apartment deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
    return Response(
        {"message": "You don't have enough rights!"}, status=status.HTTP_403_FORBIDDEN
    )


# Get House Owner by Owner ID
@api_view(["GET"])
@authentication_classes([AdminAuthentication])
@permission_classes([IsAuthenticated])
def get_house_owner_by_id(request, owner_id):
    try:
        user = User.objects.get(id=owner_id)

        if user.user_type != "owner":
            return Response(
                {"error": "User is not an owner"}, status=status.HTTP_403_FORBIDDEN
            )

        house_owner = HouseOwner.objects.get(owner=user)
        user_serializer = UserSerializer(user)
        house_owner_serializer = HouseOwnerSerializer(house_owner)

        return Response(
            {
                "user_details": user_serializer.data,
                "house_owner_details": house_owner_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except HouseOwner.DoesNotExist:
        return Response(
            {"error": "House owner details not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_by_apartment_uuid(request, apartment_uuid):
    apartment = get_object_or_404(Apartment, apartment_id=apartment_uuid)
    data = ApartmentOwnerSerializer(apartment).data
    return Response({"apartment": data})


# Get House Owner by SSN
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_house_owner_by_ssn(request, ssn):
    try:
        house_owner = HouseOwner.objects.get(SSN=ssn)
        user = house_owner.owner

        if user.user_type != "owner":
            return Response(
                {"error": "User is not an owner"}, status=status.HTTP_403_FORBIDDEN
            )

        user_serializer = UserSerializer(user)
        house_owner_serializer = HouseOwnerSerializer(house_owner)

        return Response(
            {
                "user_details": user_serializer.data,
                "house_owner_details": house_owner_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except HouseOwner.DoesNotExist:
        return Response(
            {"error": "House owner details not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_apartments_by_owner(request, owner_id):
    try:
        # 1. Get the User
        user = User.objects.get(id=owner_id)

        # 2. Check if the user is an owner
        if user.user_type != "owner":
            return Response(
                {"error": "User is not an owner"}, status=status.HTTP_403_FORBIDDEN
            )

        
        house_owner = HouseOwner.objects.get(owner=user)

        # 4. Now filter apartments by the HouseOwner
        apartments = Apartment.objects.filter(owner=house_owner)
        apartment_serializer = ApartmentSerializer(apartments, many=True)

        return Response(
            {
                "owner_id": owner_id,
                "total_apartments": apartments.count(),
                "apartments": apartment_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except HouseOwner.DoesNotExist:
        return Response({"error": "HouseOwner profile not found"}, status=status.HTTP_404_NOT_FOUND)
    

MONGO_URI = os.getenv("MONGO_HOST")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

# Initialize GridFS correctly
fs = GridFS(db)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_apartment_image(request):
    """Upload an image to MongoDB GridFS and link it to an apartment."""
    apartment_uuid = request.data.get("apartment_uuid")
    file = request.FILES.get("image")
    is_primary = True if request.data.get("is_primary") == "true" else False

    if not apartment_uuid or not file:
        return JsonResponse(
            {"error": "Missing apartment UUID or image file"}, status=400
        )

    try:
        apartment = Apartment.objects.get(apartment_id=apartment_uuid)
    except Apartment.DoesNotExist:
        return JsonResponse({"error": "Apartment not found"}, status=404)

    # Store file in GridFS
    file_id = fs.put(file.read(), filename=file.name, content_type=file.content_type)

    # Save reference in ApartmentImage model
    apartment_image = ApartmentImage.objects.create(
        apartment=apartment,
        image_path=str(file_id),  # Store GridFS file ID
        is_primary=is_primary,
    )

    return JsonResponse(
        {
            "message": "Image uploaded successfully",
            "image_id": str(apartment_image.image_id),
            "gridfs_id": str(file_id),
        },
        status=201,
    )


@api_view(["GET"])
def get_apartment_images(request, apartment_id):

    try:
        # Ensure apartment_id is a string
        if isinstance(apartment_id, uuid.UUID):
            apartment_id = str(apartment_id)

        # Fetch all ApartmentImage records for this apartment
        apartment_images = ApartmentImage.objects.filter(
            apartment__apartment_id=apartment_id
        ).select_related("apartment")

        if not apartment_images.exists():
            return JsonResponse(
                {"error": "No images found for this apartment"}, status=404
            )

        # Extract all GridFS file IDs in one go
        gridfs_ids = [ObjectId(img.image_path) for img in apartment_images]

        # Fetch all GridFS files in a single batch operation
        gridfs_files = {
            file._id: file for file in fs.find({"_id": {"$in": gridfs_ids}})
        }

        # Prepare the response data
        image_list = []
        for img in apartment_images:
            gridfs_file = gridfs_files.get(ObjectId(img.image_path))
            if gridfs_file:
                image_data = gridfs_file.read()
                image_list.append(
                    {
                        "gridfs_id": str(gridfs_file._id),
                        "image_id": str(img.image_id),
                        "filename": gridfs_file.filename,
                        "image_data": image_data.hex(),  # Convert binary to hex string
                        "is_primary": img.is_primary,
                    }
                )

        # Cache the response data for 5 minutes (300 seconds)
        response_data = {"images": image_list}

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_apartment_image(request, image_id):
    """Retrieve a single apartment image from ApartmentImage model & GridFS and return it as base64 JSON."""
    try:
        # Fetch the ApartmentImage record from the database
        apartment_image = ApartmentImage.objects.get(image_id=image_id)

        # Retrieve the image from GridFS using its stored `image_path` (GridFS file ID)
        file_obj = fs.get(ObjectId(apartment_image.image_path))
        image_data = file_obj.read()  # Read the binary image data
        base64_image = base64.b64encode(image_data).decode(
            "utf-8"
        )  # Convert binary to base64

        return JsonResponse(
            {
                "gridfs_id": str(file_obj._id),
                "image_id": str(apartment_image.image_id),
                "filename": file_obj.filename,
                "content_type": file_obj.content_type,
                "is_primary": apartment_image.is_primary,
                "image_base64": base64_image,  # Send base64 encoded image
            },
            status=200,
        )

    except ApartmentImage.DoesNotExist:
        return JsonResponse(
            {"error": "Image record not found in ApartmentImage model"}, status=404
        )

    except fs.errors.NoFile:
        return JsonResponse({"error": "Image file not found in GridFS"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_apartment_image(request, image_id):
    """Replace an apartment image in GridFS and update the reference in the database."""
    try:
        # Get the existing image record
        image = ApartmentImage.objects.get(image_id=image_id)

        # Get the new image file from request
        new_image_file = request.FILES.get("image")

        if not new_image_file:
            return JsonResponse({"error": "No new image file provided"}, status=400)

        # Delete the old image from GridFS if it exists
        if image.image_path:
            try:
                fs.delete(ObjectId(image.image_path))  # Remove from GridFS
            except fs.errors.NoFile:
                pass  # Ignore if file doesn't exist

        # Save the new image to GridFS
        new_file_id = fs.put(
            new_image_file.read(),
            filename=new_image_file.name,
            content_type=new_image_file.content_type,
        )

        # Update the database record with the new image path
        image.image_path = str(new_file_id)
        image.save()

        return JsonResponse(
            {
                "message": "Image updated successfully",
                "image_id": str(image.image_id),
                "new_image_path": str(new_file_id),
            },
            status=200,
        )

    except ApartmentImage.DoesNotExist:
        return JsonResponse({"error": "Image not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_apartment_image(request, image_id):
    """Delete an apartment image from GridFS and database."""
    try:
        image = ApartmentImage.objects.get(image_id=image_id)

        # Delete from GridFS
        if image.image_path:
            try:
                fs.delete(ObjectId(image.image_path))  # Remove from GridFS
            except fs.errors.NoFile:
                pass  # Ignore if file doesn't exist

        # Delete from Database
        image.delete()

        return JsonResponse({"message": "Image deleted successfully"}, status=200)

    except ApartmentImage.DoesNotExist:
        return JsonResponse({"error": "Image not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# Make sure that decimal values like rent_min, rent_max are not in quotes when making a request
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_search_filter(request):
    serializer = SearchFilterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get the filter of logged in user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_search_filter(request):
    filter = SearchFilter.objects.filter(user=request.user)

    if not filter.exists():
        return Response(
            {"message": "No search filter found for this user."},
            status=status.HTTP_204_NO_CONTENT,
        )

    serializer = SearchFilterSerializer(filter, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_search_filter(request):
    try:
        filter_instance = SearchFilter.objects.get(user=request.user)
    except SearchFilter.DoesNotExist:
        return Response(
            {"message": "No search filter found for this user!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = SearchFilterSerializer(
        filter_instance, data=request.data, partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_search_filter(request):
    try:
        filter = SearchFilter.objects.get(user=request.user)
    except SearchFilter.DoesNotExist:
        return Response(
            {"message": "No search filter found for this user!"},
            status=status.HTTP_404_NOT_FOUND,
        )
    filter.delete()
    return Response(
        {"message": "Search filter deleted successfully"},
        status=status.HTTP_204_NO_CONTENT,
    )


def safe_decimal(value):
    """Convert Decimal128 or string to Decimal."""
    if isinstance(value, Decimal128):
        return Decimal(
            value.to_decimal()
        )  # Convert MongoDB Decimal128 to Python Decimal
    elif isinstance(value, str):
        try:
            return Decimal(value)
        except:
            return None
    return value


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_filtered_apartments(request):
    try:
        search_filter = SearchFilter.objects.get(user=request.user)
    except:
        return Response(
            {"message": "No search filter found for this user!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    apartments = Apartment.objects.all()

    for apartment in apartments:
        apartment.rent = float(apartment.rent.to_decimal())

    if search_filter.location:
        apartments = apartments.filter(location__icontains=search_filter.location)
    if search_filter.duration:
        apartments = apartments.filter(duration=search_filter.duration)
    if search_filter.room_sharing_type:
        apartments = apartments.filter(
            room_sharing_type=search_filter.room_sharing_type
        )
    if search_filter.bhk:
        apartments = apartments.filter(bhk=search_filter.bhk)
    if search_filter.parking_available is not None:
        apartments = apartments.filter(
            parking_available=search_filter.parking_available
        )
    if search_filter.rent_min is not None:
        rent_min = safe_decimal(search_filter.rent_min)
        apartments = [apt for apt in apartments if safe_decimal(apt.rent) >= rent_min]
    if search_filter.rent_max is not None:
        rent_max = safe_decimal(search_filter.rent_max)
        apartments = [apt for apt in apartments if safe_decimal(apt.rent) <= rent_max]

    if not apartments:
        return Response(
            {"message": "No apartment found matching the search criteria"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ApartmentSerializer(apartments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    notification_message = f"You have received a new message from {request.user.name}"

    serializer = ChatSerializer(data=request.data)
    notification_serializer = NotificationSerializer(
        data={"user": receiver.id, "message": notification_message}
    )

    serializer_valid = serializer.is_valid()
    notification_serializer_valid = notification_serializer.is_valid()

    if serializer.is_valid() and notification_serializer.is_valid():

        serializer.save(sender=request.user, receiver=receiver)
        notification_serializer.save()
        return Response(
            {"message": "Message sent successfully!", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    return Response(
        {
            "message_errors": serializer.errors if not serializer_valid else None,
            "notification_errors": (
                notification_serializer.errors
                if not notification_serializer_valid
                else None
            ),
        },
        status=status.HTTP_400_BAD_REQUEST,
    )

    return Response(
        {serializer.errors, notification_serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    notification = Notification.objects.filter(user=request.user, read_status=0)

    if not notification:
        return Response(
            {"message": "No new notifications"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = NotificationSerializer(notification, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request):
    ids = request.data.get("ids", [])

    if not ids or not isinstance(ids, list):
        return Response(
            {"message": "Invalid or missing 'ids' list"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    notifications = Notification.objects.filter(
        user=request.user, notification_id__in=ids
    )

    if not notifications:
        return Response(
            {"message": "Wrong matching notifications found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    notifications.update(read_status=1)
    return Response(
        {"message": "Notifications marked as read."}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_send_messages(request):
    messages = Chat.objects.filter(sender=request.user)
    if not messages:
        return Response(
            {"message": "No message found for the current user!"},
            status=status.HTTP_404_NOT_FOUND,
        )
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_send_messages_by_user_uuid(request, user_uuid):

    user = get_object_or_404(User, user_id=user_uuid)

    # Filter messages where the sender is the specified user
    messages = Chat.objects.filter(sender=user)

    if not messages.exists():
        return Response(
            {"message": "No messages found for the specified user!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Serialize the messages
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_send_received_messages(request):
    messages = Chat.objects.filter(Q(sender=request.user) | Q(receiver=request.user))
    if not messages:
        return Response(
            {"message": "No message send or received!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_received_messages(request):
    recevied_messages = Chat.objects.filter(receiver=request.user)
    if not recevied_messages:
        return Response(
            {"message": "This user haven't received any messages!"},
            status=status.HTTP_404_NOT_FOUND,
        )
    serializer = ChatSerializer(recevied_messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_received_messages_from(request, sender_id):
    try:
        sender = User.objects.get(id=sender_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    received_messages_from = Chat.objects.filter(sender=sender, receiver=request.user)

    if not received_messages_from:
        return Response(
            {"message": "No messages received from this user!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ChatSerializer(received_messages_from, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_send_messages_to(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    send_messages_to = Chat.objects.filter(sender=request.user, receiver=receiver_id)

    if not send_messages_to:
        return Response(
            {"message": "No messages send to this user!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ChatSerializer(send_messages_to, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Get the entire chat with a particular user both send and received messages
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_send_received_messages_with(request, other_user_id):
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    messages = Chat.objects.filter(
        Q(sender=request.user, receiver=other_user)
        | Q(sender=other_user, receiver=request.user)
    )

    if not messages:
        return Response(
            {"message": "No messages sent or received with this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def total_bookings(request):
    """Get total number of bookings along with the full list"""
    bookings = Booking.objects.all()
    total = bookings.count()
    serializer = BookingSerializer(bookings, many=True)

    return Response({"total_bookings": total, "bookings": serializer.data})


@api_view(["GET"])
def bookings_by_apartment(request, apartment_id):
    """Get all bookings for a specific apartment UUID"""
    bookings = Booking.objects.filter(apartment_id=apartment_id)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def bookings_by_user(request, user_id):
    """Get all bookings for a specific user ID"""
    bookings = Booking.objects.filter(user_id=user_id)
    serializer = BookingSerializerReadOnly(bookings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_all_booking_received(request):
    booking_received = Booking.objects.filter(apartment__owner=request.user.pk)
    if not booking_received:
        return Response(
            {"message": "No booking available!"}, status=status.HTTP_204_NO_CONTENT
        )
    serializer = BookingSerializer(booking_received, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class BookingCreateView(APIView):
    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            return Response(
                {
                    "message": "Booking created successfully",
                    "booking_id": booking.booking_id,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def total_payments(request):
    """Get total number of payments along with the full list"""
    payments = Payment.objects.all()
    total = payments.count()
    serializer = PaymentSerializer(payments, many=True)

    return Response({"total_payments": total, "payments": serializer.data})


@api_view(["GET"])
def payments_by_booking(request, booking_id):
    """Get all payments for a specific booking UUID"""
    payments = Payment.objects.filter(booking_id=booking_id)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def payments_by_apartment(request, apartment_id):
    """Get all payments for a specific apartment UUID"""
    payments = Payment.objects.filter(apartment_id=apartment_id)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def payments_by_user(request, user_id):
    """Get all payments for a specific user ID"""
    payments = Payment.objects.filter(
        user_id=str(user_id)
    ).order_by("-timestamp")  # Convert user_id to string for query
    total = payments.count()
    serializer = PaymentSerializerReadOnly(payments, many=True)

    return Response({"total_payments": total, "payments": serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_payment_by_transaction_id(request, transaction_id):
    payment = Payment.objects.filter(transaction_id=transaction_id).first()

    if not payment:
        return Response(
            {"message": "No payment with the given ID"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = PaymentSerializer(payment)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_payment_by_payment_id(request, payment_id):
    payment = Payment.objects.filter(payment_id=payment_id).first()

    if not payment:
        return Response(
            {"message": "No payment with the given ID."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = PaymentSerializer(payment)

    return Response(serializer.data, status=status.HTTP_200_OK)


class PaymentInitiateView(APIView):
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(booking_id=booking_id)
            amount = request.data.get("amount")  # Amount in INR

            # Initialize Razorpay client
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY)
            )

            # Create order
            order_data = {
                "amount": int(amount * 100),  # Convert to paise
                "currency": "INR",
                "receipt": str(booking.booking_id),
                "payment_capture": 1,  # Auto capture payment
            }
            order = client.order.create(order_data)

            # Save payment details in DB
            payment = Payment.objects.create(
                booking=booking,
                user=booking.user,
                apartment=booking.apartment,
                amount=amount,
                razorpay_order_id=order["id"],
                payment_status="pending",
            )

            return Response(
                {
                    "order_id": order["id"],
                    "amount": order["amount"],
                    "currency": order["currency"],
                    "booking_id": str(booking.booking_id),
                    "razorpay_key": settings.RAZORPAY_KEY_ID,
                },
                status=status.HTTP_201_CREATED,
            )

        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def close_tab_script():
    return """
    <html>
        <head>
            <title>Payment Completed</title>
            <script>
                // Close the tab
                window.close();
            </script>
        </head>
        <body>
        </body>
    </html>
    """


@csrf_exempt
def payment_callback(request):
    if request.method == "GET":
        try:
            razorpay_payment_id = request.GET.get("razorpay_payment_id")
            razorpay_order_id = request.GET.get("razorpay_payment_link_reference_id")
            payment_status = request.GET.get("razorpay_payment_link_status")

            if not razorpay_payment_id or not razorpay_order_id or not payment_status:
                return JsonResponse({"error": "Missing parameters"}, status=400)

            if payment_status == "paid":
                # ✅ Fetch payment record from MongoDB
                payment_record = payment_collection.find_one(
                    {"razorpay_order_id": razorpay_order_id}
                )

                if not payment_record:
                    return JsonResponse(
                        {"error": "Payment record not found in DB"}, status=404
                    )

                # ✅ Extract and convert booking_id from Binary format
                booking_id_binary = payment_record.get("booking_id")

                if not booking_id_binary:
                    return JsonResponse(
                        {"error": "No booking ID found in payment record"}, status=404
                    )

                # Convert Binary UUID to string
                if isinstance(booking_id_binary, bytes):
                    booking_id = str(uuid.UUID(bytes=booking_id_binary))
                elif isinstance(booking_id_binary, uuid.UUID):
                    booking_id = str(booking_id_binary)
                else:
                    booking_id = str(booking_id_binary)  # If already string, keep it

                # ✅ Update MongoDB payment status
                result = payment_collection.update_one(
                    {"razorpay_order_id": razorpay_order_id},
                    {
                        "$set": {
                            "razorpay_payment_id": razorpay_payment_id,
                            "payment_status": "paid",
                        }
                    },
                )

                if result.modified_count > 0:
                    try:
                        with transaction.atomic():
                            # ✅ Fetch and update booking record in SQL DB
                            booking = Booking.objects.select_for_update().get(booking_id=booking_id)
                            available_beds = booking.apartment.available_beds
                            if available_beds > 0:
                                booking.status = "confirmed"
                                booking.save()
                                Apartment.objects.filter(pk=booking.apartment.pk).update(available_beds=available_beds-1)
                            else:
                                booking.status = "cancelled"
                                booking.save()
                                return Response({"message": "Payment failed"}, status=status.HTTP_400_BAD_REQUEST)

                        return HttpResponse(close_tab_script())
                    except Booking.DoesNotExist:
                        return JsonResponse(
                            {"error": "Booking not found in SQL DB"}, status=404
                        )

                return JsonResponse(
                    {"error": "Payment updated but no matching order found in DB"},
                    status=404,
                )

            return JsonResponse(
                {"error": "Payment not successful", "status": payment_status},
                status=400,
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_SECRET_KEY"))
)
client = MongoClient(os.getenv("MONGO_HOST"))
# Select the database
db = client["rental_db"]

# Select the collection (example)
payment_collection = db["rental_app_payment"]


@csrf_exempt
def generate_payment_url(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            apartment_id = data.get("apartment_id")
            amount = data.get("amount")
            booking_id = data.get("booking_id")

            if not user_id or not apartment_id or not amount or not booking_id:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            amount_paise = int(float(amount) * 100)
            transaction_id = str(uuid.uuid4())
            payment_id = str(uuid.uuid4())

            # Retry logic for Razorpay order creation
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    order_data = {
                        "amount": amount_paise,
                        "currency": "INR",
                        "receipt": transaction_id,
                        "payment_capture": 1,
                    }
                    razorpay_order = razorpay_client.order.create(order_data)
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        return JsonResponse({"error": f"Failed to create Razorpay order: {str(e)}"}, status=500)
                    sleep(1)  # Wait for 1 second before retrying

            # Retry logic for payment link creation
            for attempt in range(max_retries):
                try:
                    payment_data = {
                        "amount": amount_paise,
                        "currency": "INR",
                        "description": "Apartment Booking Payment",
                        "notify": {"sms": True, "email": True},
                        "reminder_enable": True,
                        "callback_url": "http://127.0.0.1:8000/api/payment/callback/",
                        "callback_method": "get",
                        "reference_id": razorpay_order["id"],
                    }
                    payment_link = razorpay_client.payment_link.create(payment_data)
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        return JsonResponse({"error": f"Failed to create payment link: {str(e)}"}, status=500)
                    sleep(1)

            BookingInstance = Booking.objects.filter(booking_id=booking_id).first()
            UserInstance = User.objects.filter(id=user_id).first()
            ApartmentInstance = Apartment.objects.filter(apartment_id=apartment_id).first()

            if not BookingInstance:
                return Response(
                    {"message": "No booking found with provided ID!"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not UserInstance:
                return Response(
                    {"message": "No user found with the provided ID!"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not ApartmentInstance:
                return Response(
                    {"message": "No apartment found with the provided ID!"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = PaymentSerializer(
                data={
                    "payment_id": payment_id,
                    "transaction_id": transaction_id,
                    "booking": str(BookingInstance.pk),
                    "user": str(UserInstance.pk),
                    "apartment": str(ApartmentInstance.pk),
                    "amount": float(amount),
                    "razorpay_order_id": razorpay_order["id"],
                    "razorpay_payment_id": None,
                    "razorpay_signature": None,
                    "payment_status": "pending",
                    "payment_method": "razorpay",
                }
            )

            if serializer.is_valid():
                serializer.save()
                return JsonResponse(
                    {
                        "payment_url": payment_link["short_url"],
                        "razorpay_order_id": razorpay_order["id"],
                        "transaction_id": transaction_id,
                        "payment_id": payment_id,
                        "booking_id": booking_id,
                    },
                    status=200,
                )
            return JsonResponse(serializer.errors, status=405)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@api_view(["GET"])
def check_payment_status(request, order_id):
    try:
        # Get payment details from Razorpay
        # payment = razorpay_client.order.fetch(order_id)
        # Getting data from the db see if ever breaks

        payment = Payment.objects.filter(razorpay_order_id=order_id).first()

        if not payment:
            return JsonResponse(
                {"message": "Payment failed", "status": "pending"}, status=200
            )

        return JsonResponse(
            {"message": "Payment successful", "status": payment.payment_status},
            status=200,
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
def register_admin(request):
    email = request.data.get("email")
    phone = request.data.get("phone")
    password = request.data.get(
        "password_hash"
    )  # Use password_hash instead of password
    name = request.data.get("name", "")

    if not email or not phone or not password:
        return Response(
            {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Create admin in Firebase
        user_record = auth.create_user(
            email=email, password=password, phone_number=phone
        )

        # Store admin in Django database with hashed password
        admin = Admin.objects.create(
            email=email,
            phone=phone,
            name=name,
            password_hash=make_password(
                password
            ),  # ✅ Hash the password before storing
        )
        return Response(
            {"message": "Admin created successfully", "admin_id": str(admin.admin_id)},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": e}, status=status.HTTP_400_BAD_REQUEST)


def get_tokens_for_admin(admin):
    """Manually generate JWT token for Admin model"""

    payload = {
        "admin_id": str(admin.admin_id),
        "email": admin.email,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(hours=1),  # Expires in 1 hour
        "iat": datetime.datetime.utcnow(),
    }

    access_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return {"access": access_token}


@api_view(["POST"])
def login_admin(request):
    email = request.data.get("email")
    password = request.data.get("password_hash")  # Ensure this is hashed when stored

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        admin = Admin.objects.get(email=email)

        # Verify password
        if not check_password(password, admin.password_hash):
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ✅ Generate custom JWT
        tokens = get_tokens_for_admin(admin)

        return Response(
            {
                "access": tokens["access"],
                "admin_id": str(admin.admin_id),
                "email": admin.email,
                "name": admin.name,
            },
            status=status.HTTP_200_OK,
        )

    except Admin.DoesNotExist:
        return Response(
            {"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_item_wishlist(request, apartment_id):
    try:
        apartment = Apartment.objects.get(apartment_id=apartment_id)
    except Apartment.DoesNotExist:
        return Response({"error": "Apartment not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if this user already has this apartment
    if Wishlist.objects.filter(user=request.user, apartment=apartment).exists():
        return Response(
            {"error": "This apartment is already in your wishlist"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create the wishlist item
    wishlist_item = Wishlist.objects.create(user=request.user, apartment=apartment)
    serializer = WishlistSerializer(wishlist_item)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist = Wishlist.objects.filter(user=request.user)

    serializer = WishlistSerializer(wishlist, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_item_wishlist_with_wishlist_id(request, wishlist_id):
    try:
        wishlist_item = Wishlist.objects.get(wishlist_id=wishlist_id)
    except Wishlist.DoesNotExist:
        return Response(
            {"message": "No such item in wishlist"}, status=status.HTTP_404_NOT_FOUND
        )

    wishlist_item.delete()
    return Response(
        {"message": "Successfully removed item from wishlist"},
        status=status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_item_wishlist_with_apartment_id(request, apartment_id):
    try:
        wishlist_item = Wishlist.objects.get(apartment_id=apartment_id)
    except Wishlist.DoesNotExist:
        return Response(
            {"message": "No such item in wishlist"}, status=status.HTTP_404_NOT_FOUND
        )

    wishlist_item.delete()
    return Response(
        {"message": "Successfully removed item from wishlist"},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([AdminAuthentication])
@permission_classes([IsAuthenticated])
def create_hostel_approval(request):
    data = request.data
    data["admin"] = request.user.admin_id

    serializer = HostelApprovalSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)

    return JsonResponse(serializer.errors, status=400)


@api_view(["PATCH"])
@authentication_classes([AdminAuthentication])
def approve_hostel(request, apartment_id):
    updated_count = HostelApproval.objects.filter(apartment_id=apartment_id).update(
        status="approved"
    )

    if updated_count == 0:
        return Response(
            {"message": "No aparment found with the given ID!"},
            status=status.HTTP_404_NOT_FOUND,
        )
    else:
        return Response(
            {"message": "Successfully approved hostel!"}, status=status.HTTP_200_OK
        )


@api_view(["GET"])
@authentication_classes([AdminAuthentication])  # Use the custom admin authentication
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated
def get_hostel_approval(request):
    approval = HostelApproval.objects.all()

    serializer = HostelApprovalSerializer(approval, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_approved_apartments(request):
    # Get approved apartment IDs
    approved_apartment_ids = HostelApproval.objects.filter(
        status="approved"
    ).values_list("apartment_id", flat=True)

    # Fetch approved apartments
    approved_apartments = Apartment.objects.filter(
        apartment_id__in=approved_apartment_ids
    )
    serialized_apartments = ApartmentSerializer(approved_apartments, many=True).data



    return JsonResponse(serialized_apartments, safe=False)


@api_view(["GET"])
@authentication_classes([AdminAuthentication])
@permission_classes([IsAuthenticated])
def get_pending_apartments(request):
    pending_apartment_ids = HostelApproval.objects.filter(status="pending").values_list(
        "apartment_id", flat=True
    )

    pending_apartments = Apartment.objects.filter(
        apartment_id__in=pending_apartment_ids
    ).order_by("-created_at")

    serializer = ApartmentSerializer(pending_apartments, many=True)

    return JsonResponse(serializer.data, safe=False)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_pending_apartments_for_owner(request):
    pending_apartment_ids = HostelApproval.objects.filter(status="pending").values_list(
        "apartment_id", flat=True
    )

    pending_apartments = Apartment.objects.filter(
        apartment_id__in=pending_apartment_ids
    ).order_by("-created_at")

    serializer = ApartmentSerializer(pending_apartments, many=True)

    return JsonResponse(serializer.data, safe=False)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_pending(request, owner_id):
    pending = Apartment.objects.filter(owner_id=owner_id)
    pending.delete()
    return Response({"message": "Deleted"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_complaint(request, apartment_id):
    try:
        apartment = Apartment.objects.get(apartment_id=apartment_id)
    except Apartment.DoesNotExist:
        return Response(
            {"message": "No Apartment found with given ID!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    owner = apartment.owner.owner

    notification_message = f"You have received a complaint from {request.user.name}"

    complaint_serializer = ComplaintSerializer(data=request.data)
    notification_serializer = NotificationSerializer(
        data={"user": owner.pk, "message": notification_message}
    )

    if notification_serializer.is_valid():
        if complaint_serializer.is_valid():
            complaint_serializer.save(
                complainant=request.user, apartment=apartment, owner=owner
            )
            notification_serializer.save()
            return Response(complaint_serializer.data, status=status.HTTP_200_OK)

    return Response(
        {complaint_serializer.errors, notification_serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_complaints_with_apartment_id(request, apartment_id):
    complaints = Complaint.objects.filter(apartment=apartment_id)

    if not complaints:
        return Response(
            {"message": "No complaints found with given ID!"},
            status=status.HTTP_404_NOT_FOUND,
        )
    print(complaints.__dir__)
    serializer = ComplaintSerializer(complaints, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_complaints(request):
    complaints = Complaint.objects.filter(owner=request.user)

    if not complaints:
        return Response(
            {"message": "No complaints found with given ID!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ComplaintSerializer(complaints, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def check_owner_verification(request):
    serializer = CheckOwnerVerificationSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            house_owner = HouseOwner.objects.get(owner=user)
            return Response(
                {"verified": house_owner.verified}, status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except HouseOwner.DoesNotExist:
            return Response(
                {"not verified": "Owner Not Verified Yet! Please Verify"},
                status=status.HTTP_200_OK,
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_csrf_token(request):
    csrf_token = request.COOKIES.get("csrftoken") or get_token(request)
    response = JsonResponse({"csrfToken": csrf_token})
    response["X-CSRFToken"] = csrf_token
    response.set_cookie(
        "csrftoken", csrf_token, httponly=False, samesite="None", secure=False
    )
    return response


@api_view(["GET"])
@authentication_classes([AdminAuthentication])
def get_all_users(request):
    users = User.objects.all().order_by("name")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_tenants(request):
    if request.user.user_type == "owner":
        house_owner = HouseOwner.objects.get(owner=request.user)
        user_with_booking = User.objects.filter(
            booking__apartment__owner=house_owner.pk
        ).distinct()
        serializer = UserSerializer(user_with_booking, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(
        {"message": "You are not a owner!"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    # Update allowed fields
    if "bio" in data:
        user.bio = data["bio"]
    if "date_of_birth" in data:
        user.date_of_birth = data["date_of_birth"]
    if "upi_id" in data:
        user.upi_id = data["upi_id"]

    user.save()
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_owner_details_by_receiver_id(request, receiver_id):
    # Get the user object by receiver_id
    owner = get_object_or_404(User, id=receiver_id)

    # Serialize the owner details
    serializer = UserSerializer(owner)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_received_messages_by_user(request, firebase_uuid):
    try:
        receiver = get_object_or_404(User, user_id=firebase_uuid)
        received_messages = Chat.objects.filter(receiver=receiver)

        if not received_messages.exists():
            return Response(
                {"message": "This user hasn't received any messages!"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ChatSerializer(received_messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
def get_owner_details_by_user_id(request, user_id):
    """
    Fetch owner details using user_id (Firebase UID).
    """
    # Fetch user with given user_id and check if they are an "owner"
    owner = get_object_or_404(User, user_id=user_id)

    # Serialize the user details
    serializer = UserSerializer(owner)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_messages(request, user_id):

    # Fetch user by Firebase user_id
    user = get_object_or_404(User, id=user_id)

    # Get all messages where the user is either sender or receiver
    messages = Chat.objects.filter(Q(sender=user) | Q(receiver=user)).order_by(
        "-timestamp"
    )

    if not messages.exists():
        return Response(
            {"message": "No messages found for this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Serialize messages
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_received_messages(request, user_id):

    # Fetch user by Firebase user_id
    user = get_object_or_404(User, user_id=user_id)

    # Get messages where the user is the receiver
    messages = Chat.objects.filter(receiver=user).order_by("-timestamp")

    if not messages.exists():
        return Response(
            {"message": "No received messages found for this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Serialize messages
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_approved_apartment_by_owner(request):
    if request.user.user_type == "owner":
        approved_apartments = Apartment.objects.filter(
            owner=request.user.pk, hostelapproval__status="approved"
        ).distinct()
        serializer = ApartmentSerializer(approved_apartments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(
        {"message": "You are not an owner"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_details(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(["POST"])
@authentication_classes([AdminAuthentication])
def is_logged_admin_in(request):
    return Response({"message": "Admin logged in!"}, status=status.HTTP_200_OK)


class OwnerDetailsByApartmentView(APIView):

    def get(self, request, apartment_id):
        try:
            # Get the apartment object
            apartment = get_object_or_404(Apartment, apartment_id=apartment_id)

            # Get the HouseOwner through the apartment's owner field
            house_owner = apartment.owner

            # Get the User through the HouseOwner's owner field
            user = house_owner.owner

            # Serialize both User and HouseOwner data
            user_serializer = UserSerializer(user)
            house_owner_serializer = HouseOwnerSerializer(house_owner)

            return Response(
                {
                    "success": True,
                    "apartment_id": str(apartment_id),
                    "apartment_title": apartment.title,
                    "user": user_serializer.data,
                    "house_owner": house_owner_serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to retrieve owner details",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["POST"])
def send_password_reset_email(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        # Check if user exists first
        try:
            user = auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            return Response({"error": "No user found with this email"}, status=404)
        except ValueError as e:
            return Response({"error": f"Invalid email: {str(e)}"}, status=400)

        # Generate password reset link
        try:
            link = auth.generate_password_reset_link(email)

            send_mail(
                subject="Reset Your Password",
                message=f"Click the link below to reset your password:\n{link}",
                from_email="FortiFit <alameena068@gmail.com>",
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent"}, status=200)

        except FirebaseError as e:
            return Response({"error": f"Firebase error: {str(e)}"}, status=500)

    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=500)



@api_view(["GET"])
def payments_by_owner(request, owner_id):
    
    # Get all apartments owned by the owner
    apartments = Apartment.objects.filter(owner_id=owner_id)

    # Get all payments made for bookings in those apartments
    payments = Payment.objects.filter(apartment__in=apartments)\
        .select_related("booking", "user", "apartment")\
        .order_by("-timestamp")

    total_payments = payments.count()
    total_amount = 0

    for payment in payments:
        if payment.payment_status == "paid":
            try:
                amount = payment.amount
                if isinstance(amount, Decimal128):
                    amount = amount.to_decimal()  
                elif not isinstance(amount, Decimal):
                    amount = Decimal(str(amount))  
                total_amount += amount
            except (InvalidOperation, ValueError) as e:
                print("Skipping invalid amount:", payment.amount, "Error:", e)

    serializer = OwnerPaymentDetailsSerializer(payments, many=True)
    return Response({"total_payments": total_payments, "total_amount": total_amount, "payments": serializer.data})




client = Client("alameenas/gym_assastant")
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

@csrf_exempt
def generate_description(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Extract parameters with defaults
            title = data.get('title', 'This property')
            rent = data.get('rent', '')
            bhk = data.get('bhk', '')
            available = data.get('available_beds', '')
            total = data.get('total_beds', '')
            food_count = len(data.get('food', []))
            location = data.get('location', '')
            hostel_type = data.get('hostel_type', 'hostel')
            duration = data.get('duration', 'long-term')
            parking = "with parking" if data.get('parking_available') else ""

            description = (
                f"{title} offers a {bhk} shared accommodation in {location} at ₹{rent}/month. "
                f"With {available} bed(s) available out of {total}, this {hostel_type} provides "
                f"{duration} stays{f' with {food_count} meal options' if food_count else ''}. "
                f"{parking.capitalize()}. Ideal for budget-conscious tenants."
            )

            return JsonResponse({'description': description.strip()})

        except Exception as e:
            logger.error(f"Error: {e}")
            return JsonResponse({'error': 'Generation failed'}, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)
class CompletedPaymentsTotalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(payment_status='paid').values_list('amount', flat=True)
        
        total = 0
        for amt in payments:
            try:
                if isinstance(amt, Decimal128):
                    amt = amt.to_decimal()  # Convert to Python decimal
                elif not isinstance(amt, Decimal):
                    amt = Decimal(str(amt))  # fallback for strings or float-like values
                total += amt
            except Exception as e:
                print("Skipping invalid amount:", amt, "Error:", e)

        return Response({'completed_total_amount': float(total)}) 
