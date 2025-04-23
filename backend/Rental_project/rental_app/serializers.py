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
            "id",
            "user_id",
            "upi_id",
            "name",
            "email",
            "phone",
            "password_hash",
            "date_of_birth",
            "bio",
            "user_type",
            "latitude",
            "longitude",
            "is_active"
        ]
        extra_kwargs = {
            "is_active": {"required": False},
            "id": {"read_only": True},
            "password_hash": {"write_only": True},
            'upi_id': {'required': False, 'allow_blank': True},
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
        required=False,
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
        fields = ["chat_id", "sender", "receiver", "message","timestamp"]
        extra_kwargs = {
            "chat_id": {"required": False},
            "sender": {"required": False},
            "receiver": {"required": False},
        }


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"

class BookingSerializerReadOnly(serializers.ModelSerializer):
    apartment = ApartmentSerializer()
    user = UserSerializer()

    class Meta:
        model = Booking
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"

class PaymentSerializerReadOnly(serializers.ModelSerializer):
    user = UserSerializer()
    apartment = ApartmentSerializer()
    booking = BookingSerializer()
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
        fields = '__all__'


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


class HouseOwnerDetailSerializer(serializers.ModelSerializer):
    owner = UserSerializer()

    class Meta:
        model = HouseOwner
        fields = ["owner", "verified", "SSN"]

class ApartmentOwnerSerializer(serializers.ModelSerializer):
    owner = HouseOwnerDetailSerializer()

    class Meta:
        model = Apartment
        fields = ["apartment_id", "title", "location", "rent", "bhk", "owner"]



class OwnerPaymentDetailsSerializer(serializers.ModelSerializer):
    apartment_name = serializers.CharField(source="apartment.title", read_only=True)
    check_in = serializers.DateTimeField(source="booking.booking_date", read_only=True)
    check_out = serializers.DateTimeField(source="booking.checkout_date", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_phone = serializers.CharField(source = "user.phone",read_only =True)

    class Meta:
        model = Payment
        fields = [
            "payment_id", "transaction_id", "amount", "timestamp",
            "payment_status", "payment_method",
            "apartment_name", "check_in", "check_out",
            "user_name", "user_email","user_phone"
        ]