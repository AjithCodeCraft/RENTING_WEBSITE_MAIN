from rest_framework import serializers
from .models import (
    HouseOwner,
    User,
    Apartment,
    ApartmentImage,
    Food,
    SearchFilter,
    Chat,
    Booking,
    Payment,
    Notification,
    Wishlist,
    HostelApproval,
    Complaint
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "user_id",
            "name",
            "email",
            "phone",
            "password_hash",
            "date_of_birth",
            "bio",
            "user_type",
            "latitude",
            "longitude",
        ]
        extra_kwargs = {
            "password_hash": {"write_only": True}
        }  # Hide password in responses


class HouseOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseOwner
        fields = ["owner", "SSN", "verified"]
        extra_kwargs = {"verified": {"read_only": True}}  # Admin will verify later


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ["id", "name"]


class ApartmentSerializer(serializers.ModelSerializer):
    food = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Food.objects.all(),
        required=False,  # ✅ Make food selection optional
    )

    class Meta:
        model = Apartment
        fields = "__all__"

    def create(self, validated_data):
        food_data = validated_data.pop(
            "food", []
        )  # ✅ Default to an empty list if no food is selected
        apartment = Apartment.objects.create(**validated_data)
        if food_data:
            apartment.food.set(food_data)  # ✅ Only set if food is provided
        return apartment


class ApartmentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentImage
        fields = ["image_id", "apartment", "image_path", "is_primary"]


class SearchFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchFilter
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"user": {"required": False}}


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ["chat_id", "sender", "receiver", "message"]
        extra_kwargs = {
            "chat_id": {"required": False},
            "sender": {"required": False},
            "receiver": {"required": False},
        }


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ["wishlist_id", "user", "owner", "description", "apartment", "created_at"]
        extra_kwargs = {
            "user": {"required": False},
            "apartment": {"required": False},
            "wishlist_id": {"read_only": True},
            "created_id": {"read_only": True}
        }


class HostelApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostelApproval
        fields = ['approval_id', 'apartment', 'admin', 'status', 'comments', 'created_at', 'updated_at']


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ["complainant", "apartment", "description", "status", "resolved_at"]
        extra_kwargs = {
            "complainant": {"required": False},
            "owner": {"required": False},
            "apartment": {"required": False},
            "status": {"required": False},
            "resolved_at": {"required": False},
        }


class CheckOwnerVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()