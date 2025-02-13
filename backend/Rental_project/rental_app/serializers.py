from rest_framework import serializers
from .models import HouseOwner, User, Apartment, ApartmentImage, Food, SearchFilter

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



class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ['id', 'name']

class ApartmentSerializer(serializers.ModelSerializer):
    food = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Food.objects.all(), required=False  # ✅ Make food selection optional
    )

    class Meta:
        model = Apartment
        fields = '__all__'

    def create(self, validated_data):
        food_data = validated_data.pop('food', [])  # ✅ Default to an empty list if no food is selected
        apartment = Apartment.objects.create(**validated_data)
        if food_data:
            apartment.food.set(food_data)  # ✅ Only set if food is provided
        return apartment


class ApartmentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentImage
        fields = ['image_id', 'apartment', 'image_path', 'is_primary']


class SearchFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchFilter
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'user': {"required": False}
        }
        