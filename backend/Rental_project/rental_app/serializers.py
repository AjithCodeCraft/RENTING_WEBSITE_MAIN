from rest_framework import serializers
from .models import HouseOwner, User

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