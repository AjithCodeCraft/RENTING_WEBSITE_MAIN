from uuid import uuid4
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta

# User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_id', str(uuid4()))
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with all permissions."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

# Users Model
class User(AbstractBaseUser,PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('seeker', 'Seeker'),
        ('owner', 'Owner')
    ]
    id = models.AutoField(primary_key=True)  # ✅ Add this line to fix the issue
    user_id = models.CharField(max_length=28, unique=True)  # Firebase UID is usually 28 chars
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    password_hash = models.TextField()
    date_of_birth = models.DateField(blank=True, null=True) 
    bio = models.TextField(blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # ✅ Add this
    is_superuser = models.BooleanField(default=False)  # ✅ Add this

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone']

class HouseOwner(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    verified = models.BooleanField(default=True)
    SSN = models.CharField(max_length=20, unique=True, null=True, blank=True)


class Food(models.Model):
    FOOD_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner')
    ]
    name = models.CharField(max_length=20, choices=FOOD_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()


class Apartment(models.Model):
    DURATION_CHOICES = [('short-term', 'Short-term'), ('long-term', 'Long-term')]
    ROOM_SHARING_CHOICES = [('private', 'Private'), ('shared', 'Shared')]
    BHK_CHOICES = [('1BHK', '1BHK'), ('2BHK', '2BHK'), ('3BHK', '3BHK')]
    HOSTEL_TYPE_CHOICES = [('boys', 'Boys'), ('girls', 'Girls')]
    apartment_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    owner = models.ForeignKey(HouseOwner, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=25, decimal_places=20, null=True, blank=True)
    longitude = models.DecimalField(max_digits=25, decimal_places=20, null=True, blank=True)
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
    room_sharing_type = models.CharField(max_length=20, choices=ROOM_SHARING_CHOICES)
    bhk = models.CharField(max_length=10, choices=BHK_CHOICES)
    parking_available = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_beds = models.IntegerField(default=0)
    available_beds = models.IntegerField(default=0)
    hostel_type = models.CharField(max_length=10, choices=HOSTEL_TYPE_CHOICES, null=True, blank=True)
    food = models.ManyToManyField(Food)  # Many-to-Many relationship
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class ApartmentImage(models.Model):
    image_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    image_path = models.TextField()
    is_primary = models.BooleanField(default=False)

class SearchFilter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=255, null=True, blank=True)
    rent_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rent_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duration = models.CharField(max_length=20, choices=Apartment.DURATION_CHOICES, null=True, blank=True)
    room_sharing_type = models.CharField(max_length=20, choices=Apartment.ROOM_SHARING_CHOICES, null=True, blank=True)
    bhk = models.CharField(max_length=10, choices=Apartment.BHK_CHOICES, null=True, blank=True)
    parking_available = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
def default_checkout_date():
    return timezone.now() + timedelta(days=7)

class Booking(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('cancelled', 'Cancelled'), ('completed', 'Completed')]

    booking_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey('Apartment', on_delete=models.CASCADE)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)
    checkout_date = models.DateTimeField(default=default_checkout_date)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")


class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')]
    PAYMENT_METHOD_CHOICES = [('razorpay', 'Razorpay'), ('cash', 'Cash')]

    payment_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    transaction_id = models.UUIDField(editable=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=256, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='razorpay')
    timestamp = models.DateTimeField(auto_now_add=True)


class Wishlist(models.Model):
    wishlist_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'apartment')


class Bid(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')]
    
    bid_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    

class Chat(models.Model):
    chat_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False) 
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']

class Notification(models.Model):
    notification_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    read_status = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(1)])
    timestamp = models.DateTimeField(auto_now_add=True)

class Admin(models.Model):
    admin_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    password_hash = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Complaint(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('resolved', 'Resolved'), ('rejected', 'Rejected')]
    
    complaint_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    complainant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="filed_complaints")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_complaints")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

class Report(models.Model):
    REPORT_TYPE_CHOICES = [('financial', 'Financial'), ('usage', 'Usage')]
    
    report_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    generated_by = models.ForeignKey(Admin, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Policy(models.Model):
    policy_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    last_updated = models.DateTimeField(auto_now=True)

class HostelApproval(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    approval_id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    comments = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OTPVerification(models.Model):
    email = models.EmailField(unique=True)
    otp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email