from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
import firebase_admin
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import HouseOwner, User, Apartment, ApartmentImage, SearchFilter, Chat
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from bson.decimal128 import Decimal128
from django.db.models import Q
from .serializers import (ApartmentSerializer, HouseOwnerSerializer, UserSerializer, ApartmentImageSerializer, 
                          SearchFilterSerializer, ChatSerializer)

@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    phone = request.data.get('phone')
    password = request.data.get('password_hash')  # Use password_hash instead of password
    name = request.data.get('name', '')
    user_type = request.data.get('user_type', 'seeker')

    if not email or not phone or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user in Firebase
        user_record = auth.create_user(email=email, password=password, phone_number=phone)
        
        # Store user in Django database with hashed password
        user = User.objects.create(
            user_id=user_record.uid,  # Firebase UID
            email=email,
            phone=phone,
            name=name,
            user_type=user_type,
            password_hash=make_password(password)  # ✅ Hash the password before storing
        )

        return Response({'message': 'User created successfully', 'user_id': user.user_id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    



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
            'name': user.name
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
@permission_classes([IsAuthenticated])  # ✅ Ensure authentication
def add_house_owner(request):
    ssn = request.data.get('SSN')  # Get SSN

    if not ssn:
        return Response({'error': 'SSN is required'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user  # ✅ Get authenticated user directly

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
@permission_classes([IsAuthenticated])  # ✅ Ensure only authenticated users can post
def add_apartment(request):
    user = request.user  

    if not hasattr(user, 'houseowner'):
        return Response({'error': 'Only house owners can add apartments'}, status=status.HTTP_403_FORBIDDEN)

    request.data['owner'] = user.houseowner.owner  # ✅ Assign authenticated house owner

    serializer = ApartmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Apartment added successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Fix this apartment = Apartment.objects.get(pk=pk) ->
# apartment = Apartment.objects.get(apartment_id=pk)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access
def apartment_detail(request, pk):
    """Handles GET (Retrieve), PUT (Update), and DELETE for a specific Apartment."""
    
    try:
        apartment = Apartment.objects.get(pk=pk)
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


    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_apartment_image(request):
    """Add an image to an apartment."""
    serializer = ApartmentImageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_apartment_images(request, apartment_id):
    """Retrieve all images for a specific apartment."""
    try:
        images = ApartmentImage.objects.filter(apartment_id=apartment_id)
        serializer = ApartmentImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ApartmentImage.DoesNotExist:
        return Response({'error': 'No images found for this apartment'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_apartment_image(request, image_id):
    """Retrieve a single apartment image by image ID."""
    try:
        image = ApartmentImage.objects.get(image_id=image_id)
        serializer = ApartmentImageSerializer(image)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ApartmentImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_apartment_image(request, image_id):
    """Update an apartment image (e.g., set as primary)."""
    try:
        image = ApartmentImage.objects.get(image_id=image_id)
        serializer = ApartmentImageSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except ApartmentImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_apartment_image(request, image_id):
    """Delete an apartment image."""
    try:
        image = ApartmentImage.objects.get(image_id=image_id)
        image.delete()
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
    except ApartmentImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

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
    
    serializer = ChatSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(sender=request.user, receiver=receiver)
        return Response(
            {"message": "Message sent successfully!", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
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