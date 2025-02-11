from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'phone', 'password_hash', 'user_type', 'latitude', 'longitude']
        extra_kwargs = {'password_hash': {'write_only': True}}  # Hide password in responses
