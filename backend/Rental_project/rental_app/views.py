from rest_framework_simplejwt.tokens import RefreshToken
import firebase_admin
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import HouseOwner, User, Apartment, ApartmentImage 
from .serializers import  ApartmentSerializer, HouseOwnerSerializer, UserSerializer, ApartmentImageSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password


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



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access
def apartment_list_create(request):
    """Handles GET (List) and POST (Create) for Apartments."""
    
    if request.method == 'GET':
        apartments = Apartment.objects.all()
        serializer = ApartmentSerializer(apartments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ApartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        user = User.objects.get(user_id=owner_id)

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
        user = User.objects.get(user_id=owner_id)

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