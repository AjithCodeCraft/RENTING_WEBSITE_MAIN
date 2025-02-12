from rest_framework import serializers
from .models import HouseOwner, User, Apartment, ApartmentImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'phone', 'password_hash', 'user_type', 'latitude', 'longitude']
        extra_kwargs = {'password_hash': {'write_only': True}}  # Hide password in responses


class HouseOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseOwner
        fields = ['owner', 'SSN', 'verified']
        extra_kwargs = {'verified': {'read_only': True}}  # Admin will verify later



class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = '__all__'  # Include all fields


class ApartmentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentImage
        fields = ['image_id', 'apartment', 'image_path', 'is_primary']
