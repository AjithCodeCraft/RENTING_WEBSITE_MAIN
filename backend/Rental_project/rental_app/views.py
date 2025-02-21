import base64
import datetime
import random
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
import os
from gridfs import GridFS
import jwt
from django.core.mail import send_mail
import urllib.parse
from rest_framework.parsers import JSONParser
import json
from bson import ObjectId  # If using MongoDB
from django.http import JsonResponse
from rental_app.models import Booking  # Import Booking model
import uuid  # Import UUID
import razorpay
from pymongo import MongoClient
import datetime
from django.utils import timezone
from django.http import JsonResponse
from .authentication import AdminAuthentication
from django.conf import settings
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import ( HostelApproval, HouseOwner, OTPVerification, User, Apartment, ApartmentImage, SearchFilter, Chat, Booking, Payment, 
                     Notification, Admin, Wishlist, Complaint)
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password,check_password
from decimal import Decimal
from bson.decimal128 import Decimal128
from django.db.models import Q


from django.middleware.csrf import get_token
from .serializers import (ApartmentSerializer, CheckOwnerVerificationSerializer,HouseOwnerSerializer, UserSerializer, ApartmentImageSerializer, 

                          SearchFilterSerializer, ChatSerializer, BookingSerializer,PaymentSerializer, NotificationSerializer,
                          WishlistSerializer,HostelApprovalSerializer, ComplaintSerializer)
SECRET_KEY = settings.SECRET_KEY  


@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')

    # Validate required fields
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists in MongoDB'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate a 6-digit OTP
    otp = random.randint(100000, 999999)

    # Store OTP in MongoDB (Temporary Storage)
    OTPVerification.objects.update_or_create(
        email=email,
        defaults={"otp": otp, "created_at": timezone.now()}  # Use timezone-aware timestamp
    )

    # Send OTP via email
    try:
        send_mail(
            subject="Your OTP for Registration",
            message=f"Your OTP is: {otp}. It is valid for 5 minutes.",
            from_email="alameena068@gmail.com",
            recipient_list=[email],
        )

        return Response({'message': 'OTP sent. Verify OTP to complete registration.'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error sending OTP email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if OTP is valid
    try:
        otp_entry = OTPVerification.objects.get(email=email)
        otp_created_time = otp_entry.created_at  # Already timezone-aware
        current_time = timezone.now()  # Ensure timezone awareness

        # Check OTP expiry (valid for 5 minutes)
        if (current_time - otp_created_time).total_seconds() > 300:
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Check OTP correctness
        if otp_entry.otp != int(otp):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)

    except OTPVerification.DoesNotExist:
        return Response({'error': 'OTP not found or already used'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password_hash')
    name = request.data.get('name')
    phone = request.data.get('phone')
    user_type = request.data.get('user_type', 'seeker')

    if not email or not password or not phone:
        return Response({'error': 'Email, password, and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email already exists in Firebase
    try:
        auth.get_user_by_email(email)
        return Response({'error': 'Email already exists in Firebase'}, status=status.HTTP_400_BAD_REQUEST)
    except auth.UserNotFoundError:
        pass

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists in MongoDB'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user in Firebase
        new_user = auth.create_user(
            email=email,
            password=password,
            email_verified=True
        )

        # Update user profile to include phone number
        auth.update_user(
            new_user.uid,
            phone_number=phone
        )

        # Store user details in MongoDB
        user = User.objects.create(
            user_id=new_user.uid,
            email=email,
            phone=phone,
            name=name,
            user_type=user_type,
            password_hash=make_password(password)
        )

        return Response({
            "message": "User created successfully",
            "user_id": new_user.uid
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password_hash')  # Use password_hash for login

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Authenticate using Firebase
        user = User.objects.get(email=email)

        # Since Firebase handles authentication, we don't check the password manually
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.user_id,
            'email': user.email,
            'name': user.name,
            'user_type':user.user_type
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensure authentication
def get_house_owner(request):
    user = request.user  # Get authenticated user

    if user.user_type != 'owner':
        return Response({'error': 'User is not a house owner'}, status=status.HTTP_403_FORBIDDEN)
    house_owner = get_object_or_404(HouseOwner, owner=user)
    serializer = HouseOwnerSerializer(house_owner)
    return Response(serializer.data, status=status.HTTP_200_OK)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])  #  Ensure authentication
def add_house_owner(request):
    ssn = request.data.get('SSN')  # Get SSN

    if not ssn:
        return Response({'error': 'SSN is required'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user  # Get authenticated user directly

    if user.user_type != 'owner':
        return Response({'error': 'User is not a house owner'}, status=status.HTTP_403_FORBIDDEN)

    # Prevent duplicate entries
    if HouseOwner.objects.filter(owner=user).exists():
        return Response({'error': 'House owner record already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Serialize and save HouseOwner
    serializer = HouseOwnerSerializer(data={'owner': user.id, 'SSN': ssn})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'House owner record created successfully'}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_apartment_list(request):
    apartments = Apartment.objects.all()
    serializer = ApartmentSerializer(apartments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  #  Ensure only authenticated users can post
def add_apartment(request):
    user = request.user  

    if not hasattr(user, 'houseowner'):
        return Response({'error': 'Only house owners can add apartments'}, status=status.HTTP_403_FORBIDDEN)

    request.data['owner'] = user.houseowner.owner  # Assign authenticated house owner

    serializer = ApartmentSerializer(data=request.data)
    if serializer.is_valid():
        apartment = serializer.save()  # Save the apartment

        # Create a HostelApproval record with 'pending' status for this apartment
        HostelApproval.objects.create(
            apartment=apartment,
            admin=None,  # Initially, no admin assigned
            status='pending',  # Set the status to 'pending'
            comments='Approval pending.',  # You can add default comments or leave it blank
        )

        return Response({'message': 'Apartment added successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([AdminAuthentication])  
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access
def apartment_detail(request, pk):
    """Handles GET (Retrieve), PUT (Update), and DELETE for a specific Apartment."""
    
    try:
        apartment = Apartment.objects.get(apartment_id=pk)
    except Apartment.DoesNotExist:
        return Response({'error': 'Apartment not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ApartmentSerializer(apartment)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ApartmentSerializer(apartment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        apartment.delete()
        return Response({'message': 'Apartment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)



# Get House Owner by Owner ID
@api_view(['GET'])
@authentication_classes([AdminAuthentication])  
@permission_classes([IsAuthenticated])
def get_house_owner_by_id(request, owner_id):
    try:
        user = User.objects.get(id=owner_id)

        if user.user_type != 'owner':
            return Response({'error': 'User is not an owner'}, status=status.HTTP_403_FORBIDDEN)

        house_owner = HouseOwner.objects.get(owner=user)
        user_serializer = UserSerializer(user)
        house_owner_serializer = HouseOwnerSerializer(house_owner)

        return Response({
            'user_details': user_serializer.data,
            'house_owner_details': house_owner_serializer.data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except HouseOwner.DoesNotExist:
        return Response({'error': 'House owner details not found'}, status=status.HTTP_404_NOT_FOUND)



# Get House Owner by SSN
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_house_owner_by_ssn(request, ssn):
    try:
        house_owner = HouseOwner.objects.get(SSN=ssn)
        user = house_owner.owner

        if user.user_type != 'owner':
            return Response({'error': 'User is not an owner'}, status=status.HTTP_403_FORBIDDEN)

        user_serializer = UserSerializer(user)
        house_owner_serializer = HouseOwnerSerializer(house_owner)

        return Response({
            'user_details': user_serializer.data,
            'house_owner_details': house_owner_serializer.data
        }, status=status.HTTP_200_OK)

    except HouseOwner.DoesNotExist:
        return Response({'error': 'House owner details not found'}, status=status.HTTP_404_NOT_FOUND)



# Get All Apartments by Owner ID
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_apartments_by_owner(request, owner_id):
    try:
        user = User.objects.get(id=owner_id)

        if user.user_type != 'owner':
            return Response({'error': 'User is not an owner'}, status=status.HTTP_403_FORBIDDEN)

        apartments = Apartment.objects.filter(owner__owner=user)
        apartment_serializer = ApartmentSerializer(apartments, many=True)

        return Response({
            'owner_id': owner_id,
            'total_apartments': apartments.count(),
            'apartments': apartment_serializer.data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'Owner not found'}, status=status.HTTP_404_NOT_FOUND)


    
MONGO_URI = os.getenv("MONGO_HOST")  
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")  

# Connect to MongoDB
client = MongoClient(MONGO_URI)  
db = client[MONGO_DB_NAME]  

# Initialize GridFS correctly
fs = GridFS(db) 


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_apartment_image(request):
    """Upload an image to MongoDB GridFS and link it to an apartment."""
    apartment_uuid = request.data.get('apartment_uuid')
    file = request.FILES.get('image')

    if not apartment_uuid or not file:
        return JsonResponse({'error': 'Missing apartment UUID or image file'}, status=400)

    try:
        apartment = Apartment.objects.get(apartment_id=apartment_uuid)
    except Apartment.DoesNotExist:
        return JsonResponse({'error': 'Apartment not found'}, status=404)

    # Store file in GridFS
    file_id = fs.put(file.read(), filename=file.name, content_type=file.content_type)

    # Save reference in ApartmentImage model
    apartment_image = ApartmentImage.objects.create(
        apartment=apartment,
        image_path=str(file_id)  # Store GridFS file ID
    )

    return JsonResponse({
        'message': 'Image uploaded successfully',
        'image_id': str(apartment_image.image_id),
        'gridfs_id': str(file_id)
    }, status=201)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_apartment_images(request, apartment_id):
    """Retrieve all images for a specific apartment from ApartmentImage model & GridFS."""
    try:
        # Ensure apartment_id is a string before using it
        if isinstance(apartment_id, uuid.UUID):
            apartment_id = str(apartment_id)  # Convert UUID object to string
        
        print(f"Received apartment_id: {apartment_id}")  # Debugging

        # Fetch images from ApartmentImage model
        apartment_images = ApartmentImage.objects.filter(apartment__apartment_id=apartment_id)
        
        if not apartment_images.exists():
            return JsonResponse({'error': 'No images found for this apartment'}, status=404)

        image_list = []

        for img in apartment_images:
            try:
                # Get the image from GridFS using image_path (GridFS file ID)
                gridfs_file = fs.get(ObjectId(img.image_path))
                image_data = gridfs_file.read()  # Read binary data
                
                image_list.append({
                    "gridfs_id": str(gridfs_file._id),
                    "image_id": str(img.image_id),
                    "filename": gridfs_file.filename,
                    "image_data": image_data.hex(),  # Convert binary to hex string
                    "is_primary": img.is_primary
                })
            except Exception as e:
                print(f"Error retrieving image from GridFS: {e}")

        return JsonResponse({"images": image_list}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_apartment_image(request, image_id):
    """Retrieve a single apartment image from ApartmentImage model & GridFS and return it as base64 JSON."""
    try:
        # Fetch the ApartmentImage record from the database
        apartment_image = ApartmentImage.objects.get(image_id=image_id)

        # Retrieve the image from GridFS using its stored `image_path` (GridFS file ID)
        file_obj = fs.get(ObjectId(apartment_image.image_path))
        image_data = file_obj.read()  # Read the binary image data
        base64_image = base64.b64encode(image_data).decode('utf-8')  # Convert binary to base64

        return JsonResponse({
            "gridfs_id": str(file_obj._id),
            "image_id": str(apartment_image.image_id),
            "filename": file_obj.filename,
            "content_type": file_obj.content_type,
            "is_primary": apartment_image.is_primary,
            "image_base64": base64_image  # Send base64 encoded image
        }, status=200)

    except ApartmentImage.DoesNotExist:
        return JsonResponse({'error': 'Image record not found in ApartmentImage model'}, status=404)

    except fs.errors.NoFile:
        return JsonResponse({'error': 'Image file not found in GridFS'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_apartment_image(request, image_id):
    """Replace an apartment image in GridFS and update the reference in the database."""
    try:
        # Get the existing image record
        image = ApartmentImage.objects.get(image_id=image_id)

        # Get the new image file from request
        new_image_file = request.FILES.get('image')

        if not new_image_file:
            return JsonResponse({'error': 'No new image file provided'}, status=400)

        # Delete the old image from GridFS if it exists
        if image.image_path:
            try:
                fs.delete(ObjectId(image.image_path))  # Remove from GridFS
            except fs.errors.NoFile:
                pass  # Ignore if file doesn't exist

        # Save the new image to GridFS
        new_file_id = fs.put(new_image_file.read(), filename=new_image_file.name, content_type=new_image_file.content_type)

        # Update the database record with the new image path
        image.image_path = str(new_file_id)
        image.save()

        return JsonResponse({
            "message": "Image updated successfully",
            "image_id": str(image.image_id),
            "new_image_path": str(new_file_id)
        }, status=200)

    except ApartmentImage.DoesNotExist:
        return JsonResponse({'error': 'Image not found'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)




@api_view(['DELETE'])
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
        
        return JsonResponse({'message': 'Image deleted successfully'}, status=200)

    except ApartmentImage.DoesNotExist:
        return JsonResponse({'error': 'Image not found'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

# Make sure that decimal values like rent_min, rent_max are not in quotes when making a request
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_search_filter(request):
    serializer = SearchFilterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get the filter of logged in user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_search_filter(request):
    filter = SearchFilter.objects.filter(user=request.user)
    
    if not filter.exists():
        return Response(
            {"message": "No search filter found for this user."},
            status=status.HTTP_204_NO_CONTENT
        )
    
    serializer = SearchFilterSerializer(filter, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_search_filter(request):
    try:
        filter_instance = SearchFilter.objects.get(user=request.user)
    except SearchFilter.DoesNotExist:
        return Response(
            {"message": "No search filter found for this user!"},
            status=status.HTTP_404_NOT_FOUND    
        )
    
    serializer = SearchFilterSerializer(filter_instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_search_filter(request):
    try:
        filter = SearchFilter.objects.get(user=request.user)
    except SearchFilter.DoesNotExist:
        return Response(
                {"message": "No search filter found for this user!"},
            status=status.HTTP_404_NOT_FOUND    
        )
    filter.delete()
    return Response(
        {"message": "Search filter deleted successfully"},
        status=status.HTTP_204_NO_CONTENT
    )
    


def safe_decimal(value):
    """Convert Decimal128 or string to Decimal."""
    if isinstance(value, Decimal128):
        return Decimal(value.to_decimal())  # Convert MongoDB Decimal128 to Python Decimal
    elif isinstance(value, str):
        try:
            return Decimal(value)
        except:
            return None
    return value

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_filtered_apartments(request):
    try:
        search_filter = SearchFilter.objects.get(user=request.user)
    except:
        return Response(
            {"message": "No search filter found for this user!"},
            status=status.HTTP_404_NOT_FOUND    
        )
        
    apartments = Apartment.objects.all()
    
    for apartment in apartments:
        apartment.rent = float(apartment.rent.to_decimal())
    
    if search_filter.location:
        apartments = apartments.filter(location__icontains=search_filter.location)
    if search_filter.duration:
        apartments = apartments.filter(duration=search_filter.duration)
    if search_filter.room_sharing_type:
        apartments = apartments.filter(room_sharing_type=search_filter.room_sharing_type)
    if search_filter.bhk:
        apartments = apartments.filter(bhk=search_filter.bhk)
    if search_filter.parking_available is not None:
        apartments = apartments.filter(parking_available=search_filter.parking_available)
    if search_filter.rent_min is not None:
        rent_min = safe_decimal(search_filter.rent_min)
        apartments = [apt for apt in apartments if safe_decimal(apt.rent) >= rent_min]
    if search_filter.rent_max is not None:
        rent_max = safe_decimal(search_filter.rent_max)
        apartments = [apt for apt in apartments if safe_decimal(apt.rent) <= rent_max]

    if not apartments:
        return Response(
            {"message": "No apartment found matching the search criteria"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ApartmentSerializer(apartments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
        
@api_view(['POST'])        
@permission_classes([IsAuthenticated])
def send_message(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    notification_message = f"You have received a new message from {request.user.name}"
    
    serializer = ChatSerializer(data=request.data)
    notification_serializer = NotificationSerializer(data={"user": receiver.id, "message": notification_message})
    
    if serializer.is_valid() and notification_serializer.is_valid():
        serializer.save(sender=request.user, receiver=receiver)
        notification_serializer.save()
        return Response (
            {"message": "Message sent successfully!", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    return Response({serializer.errors, notification_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])        
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    
    notification = Notification.objects.filter(user=request.user, read_status=0)
    
    if not notification:
        return Response(
            {"message": "No new notifications"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    serializer = NotificationSerializer(notification, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])        
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request):
    ids = request.data.get("ids", [])
    
    if not ids or not isinstance(ids, list):
        return Response(
            {"message": "Invalid or missing 'ids' list"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    notifications = Notification.objects.filter(user=request.user, notification_id__in=ids)
    
    if not notifications:
        return Response(
            {"message": "Wrong matching notifications found"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    notifications.update(read_status=1)
    return Response(
        {"message": "Notifications marked as read."},
        status=status.HTTP_200_OK
    )
    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_send_messages(request):
    messages = Chat.objects.filter(sender=request.user)
    if not messages:
        return Response(
            {"message": "No message found for the current user!"},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_send_received_messages(request):
    messages = Chat.objects.filter(Q(sender=request.user) | Q(receiver=request.user))
    if not messages:
        return Response(
            {"message": "No message send or received!"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_received_messages(request):
    
    recevied_messages = Chat.objects.filter(receiver=request.user)
    if not recevied_messages:
        return Response(
            {"message": "This user haven't received any messages!"},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = ChatSerializer(recevied_messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_received_messages_from(request, sender_id):
    try:
        sender = User.objects.get(id=sender_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    received_messages_from = Chat.objects.filter(sender=sender, receiver=request.user)
    
    if not received_messages_from:
        return Response(
            {"message": "No messages received from this user!"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    serializer = ChatSerializer(received_messages_from, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_send_messages_to(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    send_messages_to = Chat.objects.filter(sender=request.user, receiver=receiver_id)
    
    if not send_messages_to:
        return Response(
            {"message": "No messages send to this user!"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ChatSerializer(send_messages_to, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get the entire chat with a particular user both send and received messages
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_send_received_messages_with(request, other_user_id):
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response(
            {"message": "No user found with the given id!"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    messages = Chat.objects.filter(
        Q(sender=request.user, receiver=other_user) | Q(sender=other_user, receiver=request.user))
    
    if not messages:
        return Response(
            {"message": "No messages sent or received with this user."},
            status=status.HTTP_404_NOT_FOUND
        )
        
    serializer = ChatSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET'])
def total_bookings(request):
    """ Get total number of bookings along with the full list """
    bookings = Booking.objects.all()
    total = bookings.count()
    serializer = BookingSerializer(bookings, many=True)
    
    return Response({
        "total_bookings": total,
        "bookings": serializer.data
    })




@api_view(['GET'])
def bookings_by_apartment(request, apartment_id):
    """ Get all bookings for a specific apartment UUID """
    bookings = Booking.objects.filter(apartment_id=apartment_id)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def bookings_by_user(request, user_id):
    """ Get all bookings for a specific user ID """
    bookings = Booking.objects.filter(user_id=user_id)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)



class BookingCreateView(APIView):
    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            return Response({"message": "Booking created successfully", "booking_id": booking.booking_id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def total_payments(request):
    """ Get total number of payments along with the full list """
    payments = Payment.objects.all()
    total = payments.count()
    serializer = PaymentSerializer(payments, many=True)
    
    return Response({
        "total_payments": total,
        "payments": serializer.data
    })


@api_view(['GET'])
def payments_by_booking(request, booking_id):
    """ Get all payments for a specific booking UUID """
    payments = Payment.objects.filter(booking_id=booking_id)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def payments_by_apartment(request, apartment_id):
    """ Get all payments for a specific apartment UUID """
    payments = Payment.objects.filter(apartment_id=apartment_id)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def payments_by_user(request, user_id):
    """ Get all payments for a specific user ID """
    payments = Payment.objects.filter(user_id=str(user_id))  # Convert user_id to string for query
    total = payments.count()
    serializer = PaymentSerializer(payments, many=True)

    return Response({
        "total_payments": total,
        "payments": serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_by_transaction_id(request, transaction_id):
    payment = Payment.objects.filter(transaction_id=transaction_id).first()
    
    if not payment:
        return Response (
            {"message": "No payment with the given ID"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PaymentSerializer(payment)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_by_payment_id(request, payment_id):
    payment = Payment.objects.filter(payment_id=payment_id).first()
    
    if not payment:
        return Response (
            {"message": "No payment with the given ID."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PaymentSerializer(payment)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

class PaymentInitiateView(APIView):
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(booking_id=booking_id)
            amount = request.data.get('amount')  # Amount in INR

            # Initialize Razorpay client
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))

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
                razorpay_order_id=order['id'],
                payment_status="pending"
            )

            return Response({
                "order_id": order['id'],
                "amount": order['amount'],
                "currency": order['currency'],
                "booking_id": str(booking.booking_id),
                "razorpay_key": settings.RAZORPAY_KEY_ID,
            }, status=status.HTTP_201_CREATED)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
                payment_record = payment_collection.find_one({"razorpay_order_id": razorpay_order_id})

                if not payment_record:
                    return JsonResponse({"error": "Payment record not found in DB"}, status=404)

                # ✅ Extract and convert booking_id from Binary format
                booking_id_binary = payment_record.get("booking_id")
                
                if not booking_id_binary:
                    return JsonResponse({"error": "No booking ID found in payment record"}, status=404)

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
                    {"$set": {
                        "razorpay_payment_id": razorpay_payment_id,
                        "payment_status": "paid"
                    }}
                )

                if result.modified_count > 0:
                    try:
                        # ✅ Fetch and update booking record in SQL DB
                        booking = Booking.objects.get(booking_id=booking_id)
                        booking.status = "confirmed"  
                        booking.save()  

                        return JsonResponse({
                            "message": "Payment successful and booking confirmed",
                            "status": "paid",
                            "booking_status": "confirmed",
                            "booking_id": str(booking_id)  # ✅ Convert UUID to string
                        }, status=200)
                    except Booking.DoesNotExist:
                        return JsonResponse({"error": "Booking not found in SQL DB"}, status=404)

                return JsonResponse({"error": "Payment updated but no matching order found in DB"}, status=404)

            return JsonResponse({"error": "Payment not successful", "status": payment_status}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)







razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_SECRET_KEY")))
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
            user_id = data.get("user_id")  # Required user ID
            apartment_id = data.get("apartment_id")  # Required apartment ID
            amount = data.get("amount")  # Required amount in INR
            booking_id = data.get("booking_id")  # Required booking ID

            if not user_id or not apartment_id or not amount or not booking_id:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # Convert amount to paise
            amount_paise = int(float(amount) * 100)

            # ✅ Generate unique transaction and payment IDs (Convert UUIDs to strings)
            transaction_id = str(uuid.uuid4())
            payment_id = str(uuid.uuid4())

            # ✅ Create an **order** in Razorpay
            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": transaction_id,
                "payment_capture": 1  # Auto-capture payment
            }
            razorpay_order = razorpay_client.order.create(order_data)

            # ✅ Create the payment link on Razorpay with the order ID
            payment_data = {
                "amount": amount_paise,
                "currency": "INR",
                "description": "Apartment Booking Payment",
                "notify": {"sms": True, "email": True},
                "reminder_enable": True,
                "callback_url": "http://127.0.0.1:8000/payment/callback/",
                "callback_method": "get",
                "reference_id": razorpay_order["id"]  # ✅ Store correct order ID
            }

            payment_link = razorpay_client.payment_link.create(payment_data)

            # ✅ Save the order details in MongoDB (Explicitly store UUIDs as strings)
            
            BookingInstance = Booking.objects.filter(booking_id=booking_id).first()
            UserInstance = User.objects.filter(id=user_id).first()
            ApartmentInstance = Apartment.objects.filter(apartment_id=apartment_id).first()
            if not BookingInstance:
                return Response(
                    {"message": "No booking found with provided ID!"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            if not UserInstance:
                return Response(
                    {"message": "No user found with the provided ID!"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            if not ApartmentInstance:
                return Response(
                    {"message": "No apartment found with the provided ID!"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            serializer = PaymentSerializer(data={
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
                "payment_method": "razorpay"
            })
            
            if serializer.is_valid():
                serializer.save()
            
                return JsonResponse({
                    "payment_url": payment_link["short_url"],
                    "razorpay_order_id": razorpay_order["id"],  
                    "transaction_id": transaction_id,  
                    "payment_id": payment_id,  
                    "booking_id": booking_id  
                }, status=200)
            
            return JsonResponse(serializer.errors, status=405)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)




def check_payment_status(request, order_id):
    try:
        # Get payment details from Razorpay
        payment = razorpay_client.order.fetch(order_id)
        
        if payment["status"] == "paid":
            # Update payment status in your database
            Payment.objects.filter(razorpay_order_id=order_id).update(
                payment_status="paid",
                razorpay_payment_id=payment["id"],
                razorpay_signature=payment.get("signature", "")
            )
            return JsonResponse({"message": "Payment successful", "status": "paid"}, status=200)
        else:
            return JsonResponse({"message": "Payment pending", "status": "pending"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)





@api_view(['POST'])
def register_admin(request):
    email = request.data.get('email')
    phone = request.data.get('phone')
    password = request.data.get('password_hash')  # Use password_hash instead of password
    name = request.data.get('name', '')

    if not email or not phone or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create admin in Firebase
        user_record = auth.create_user(email=email, password=password, phone_number=phone)

        # Store admin in Django database with hashed password
        admin = Admin.objects.create(
            email=email,
            phone=phone,
            name=name,
            password_hash=make_password(password)  # ✅ Hash the password before storing
        )
        return Response({'message': 'Admin created successfully', 'admin_id': str(admin.admin_id)}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': e}, status=status.HTTP_400_BAD_REQUEST)




def get_tokens_for_admin(admin):
    """Manually generate JWT token for Admin model"""
    
    payload = {
        'admin_id': str(admin.admin_id),
        'email': admin.email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),  # Expires in 1 hour
        'iat': datetime.datetime.utcnow()
    }
    
    access_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    return {
        'access': access_token
    }


@api_view(['POST'])
def login_admin(request):
    email = request.data.get('email')
    password = request.data.get('password_hash')  # Ensure this is hashed when stored

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        admin = Admin.objects.get(email=email)

        # Verify password
        if not check_password(password, admin.password_hash):
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        # ✅ Generate custom JWT
        tokens = get_tokens_for_admin(admin)

        return Response({
            "access": tokens["access"],
            "admin_id": str(admin.admin_id),
            "email": admin.email,
            "name": admin.name
        }, status=status.HTTP_200_OK)

    except Admin.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_item_wishlist(request, apartment_id):
    apartment = Apartment.objects.get(apartment_id=apartment_id)
    
    if not apartment:
        return Response(
            {"message": "No apartment found with the give ID!"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    wishlist_serializer = WishlistSerializer(data={"apartment": apartment_id})
    
    if wishlist_serializer.is_valid():
        wishlist_serializer.save(user=request.user)
        return Response(wishlist_serializer.data, status=status.HTTP_200_OK)
    return Response(
        {"message": wishlist_serializer.errors, "error": "Apartment already in Wishlist!"},
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist = Wishlist.objects.filter(user=request.user)

    if not wishlist:
        return Response(
            {"message": "Wish list is empty!"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    serializer = WishlistSerializer(wishlist, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_item_wishlist_with_wishlist_id(request, wishlist_id):
    try:
        wishlist_item = Wishlist.objects.get(wishlist_id=wishlist_id)
    except Wishlist.DoesNotExist:
        return Response(
            {"message": "No such item in wishlist"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    wishlist_item.delete()
    return Response(
        {"message": "Successfully removed item from wishlist"},
        status=status.HTTP_200_OK
    )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_item_wishlist_with_apartment_id(request, apartment_id):
    try:
        wishlist_item = Wishlist.objects.get(apartment_id=apartment_id)
    except Wishlist.DoesNotExist:
        return Response(
            {"message": "No such item in wishlist"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    wishlist_item.delete()
    return Response(
        {"message": "Successfully removed item from wishlist"},
        status=status.HTTP_200_OK
    )
    


@api_view(['POST'])
@authentication_classes([AdminAuthentication]) 
@permission_classes([IsAuthenticated])  
def create_hostel_approval(request):
    
    data = request.data
    data['admin'] = request.user.admin_id 

    serializer = HostelApprovalSerializer(data=data)
    
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    
    return JsonResponse(serializer.errors, status=400)

@api_view(['PATCH'])
@authentication_classes([AdminAuthentication])
def approve_hostel(request, apartment_id):
    updated_count = HostelApproval.objects.filter(apartment_id=apartment_id).update(status="approved")
    
    if updated_count == 0:
        return Response(
            {"message": "No aparment found with the given ID!"},
            status=status.HTTP_404_NOT_FOUND
        )
    else:
        return Response(
            {"message": "Successfully approved hostel!"},
            status=status.HTTP_200_OK
        )

@api_view(['GET'])
@authentication_classes([AdminAuthentication])  # Use the custom admin authentication
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated
def get_hostel_approval(request):
    approval = HostelApproval.objects.all()
    
    serializer = HostelApprovalSerializer(approval, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_approved_apartments(request):
    # Get approved apartment IDs
    approved_apartment_ids = HostelApproval.objects.filter(status='approved').values_list('apartment_id', flat=True)
    
    # Fetch approved apartments
    approved_apartments = Apartment.objects.filter(apartment_id__in=approved_apartment_ids)
    serialized_apartments = ApartmentSerializer(approved_apartments, many=True).data
    
  
    for apartment in serialized_apartments:
        apartment_id = apartment['apartment_id']  # Ensure this matches your Apartment model's field

       
        apartment_images = ApartmentImage.objects.filter(apartment_id=apartment_id)
        image_list = []

        for img in apartment_images:
            try:
                
                gridfs_file = fs.get(ObjectId(img.image_path))
                image_data = base64.b64encode(gridfs_file.read()).decode('utf-8')  # Convert to base64

                image_list.append({
                    "gridfs_id": str(gridfs_file._id),
                    "image_id": str(img.image_id),
                    "filename": gridfs_file.filename,
                    "image_data": image_data, 
                    "is_primary": img.is_primary
                })
            except Exception as e:
                print(f"Error retrieving image from GridFS: {e}")

        # Attach image list to the apartment data
        apartment["hostel_images"] = image_list

    return JsonResponse(serialized_apartments, safe=False)



@api_view(['GET'])
@authentication_classes([AdminAuthentication])
@permission_classes([IsAuthenticated])
def get_pending_apartments(request):
   
    pending_apartment_ids = HostelApproval.objects.filter(status='pending').values_list('apartment_id', flat=True)
    
    pending_apartments = Apartment.objects.filter(apartment_id__in=pending_apartment_ids).order_by('-created_at')  
    
    serializer = ApartmentSerializer(pending_apartments, many=True)
    
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_apartments_for_owner(request):
   
    pending_apartment_ids = HostelApproval.objects.filter(status='pending').values_list('apartment_id', flat=True)
    
    pending_apartments = Apartment.objects.filter(apartment_id__in=pending_apartment_ids).order_by('-created_at')  
    
    serializer = ApartmentSerializer(pending_apartments, many=True)
    
    return JsonResponse(serializer.data, safe=False)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pending(request, owner_id):
    pending = Apartment.objects.filter(owner_id=owner_id)
    pending.delete()
    return Response({"message": "Deleted"}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_complaint(request, apartment_id):
    try:
        apartment = Apartment.objects.get(apartment_id=apartment_id)
    except Apartment.DoesNotExist:
        return Response (
            {"message": "No Apartment found with given ID!"},
            status=status.HTTP_404_NOT_FOUND
        )
        
    owner = apartment.owner.owner
    

    notification_message = f"You have received a complaint from {request.user.name}"
    
    complaint_serializer = ComplaintSerializer(data=request.data)
    notification_serializer = NotificationSerializer(data={"user": owner.pk, "message": notification_message})
    
    if notification_serializer.is_valid():
        if complaint_serializer.is_valid():
                complaint_serializer.save(complainant=request.user, apartment=apartment, owner=owner)
                notification_serializer.save()
                return Response(complaint_serializer.data, status=status.HTTP_200_OK)
    
    return Response(
        {complaint_serializer.errors, notification_serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_complaints_with_apartment_id(request, apartment_id):
    complaints = Complaint.objects.filter(apartment=apartment_id)
    
    if not complaints:
        return Response (
            {"message": "No complaints found with given ID!"},
            status=status.HTTP_404_NOT_FOUND
        )
    print(complaints.__dir__)
    serializer = ComplaintSerializer(complaints, many=True)
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )
    
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_complaints(request):
    complaints = Complaint.objects.filter(owner=request.user)
    
    if not complaints:
        return Response (
            {"message": "No complaints found with given ID!"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ComplaintSerializer(complaints, many=True)
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def check_owner_verification(request):
    serializer = CheckOwnerVerificationSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            house_owner = HouseOwner.objects.get(owner=user)
            return Response({'verified': house_owner.verified}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except HouseOwner.DoesNotExist:
            return Response({'error': 'House owner not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_csrf_token(request):
    csrf_token = request.COOKIES.get("csrftoken") or get_token(request)
    response = JsonResponse({"csrfToken": csrf_token})
    response['X-CSRFToken'] = csrf_token
    response.set_cookie("csrftoken", csrf_token, httponly=False, samesite="None", secure=False)
    return response

@api_view(['GET'])
@authentication_classes([AdminAuthentication])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    