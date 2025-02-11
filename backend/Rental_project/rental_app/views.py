from rest_framework_simplejwt.tokens import RefreshToken
import firebase_admin
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import HouseOwner, User, Apartment
from .serializers import  ApartmentSerializer, HouseOwnerSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

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
        
        # Store user in Django database
        user = User.objects.create(
            user_id=user_record.uid,  # Firebase UID
            email=email,
            phone=phone,
            name=name,
            user_type=user_type,
            password_hash=password  # Store raw password (not recommended)
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
