import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, phone, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        if not phone:
            raise ValueError("The Phone field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

# Users Model
class User(AbstractBaseUser):
    USER_TYPE_CHOICES = [
        ('seeker', 'Seeker'),
        ('owner', 'Owner')
    ]

    user_id = models.CharField(max_length=28, primary_key=True)  # Firebase UID is usually 28 chars
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    password_hash = models.TextField()
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone']

class HouseOwner(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    verified = models.BooleanField(default=False)
    SSN = models.CharField(max_length=20, unique=True, null=True, blank=True)

class Apartment(models.Model):
    DURATION_CHOICES = [('short-term', 'Short-term'), ('long-term', 'Long-term')]
    ROOM_SHARING_CHOICES = [('private', 'Private'), ('shared', 'Shared')]
    BHK_CHOICES = [('1BHK', '1BHK'), ('2BHK', '2BHK'), ('3BHK', '3BHK')]
    
    apartment_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    owner = models.ForeignKey(HouseOwner, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
    room_sharing_type = models.CharField(max_length=20, choices=ROOM_SHARING_CHOICES)
    bhk = models.CharField(max_length=10, choices=BHK_CHOICES)
    parking_available = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_beds = models.IntegerField(default=0)
    available_beds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ApartmentImage(models.Model):
    image_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
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

class Booking(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('cancelled', 'Cancelled'), ('completed', 'Completed')]
    
    booking_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')]
    PAYMENT_METHOD_CHOICES = [('gpay', 'GPay'), ('cash', 'Cash')]
    
    payment_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

class Wishlist(models.Model):
    wishlist_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Bid(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')]
    
    bid_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    

class Chat(models.Model):
    chat_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    notification_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    read_status = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

class Admin(models.Model):
    ROLE_CHOICES = [('super_admin', 'Super Admin'), ('moderator', 'Moderator')]
    
    admin_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    password_hash = models.TextField()
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class Complaint(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('resolved', 'Resolved'), ('rejected', 'Rejected')]
    
    complaint_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    admin = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

class Report(models.Model):
    REPORT_TYPE_CHOICES = [('financial', 'Financial'), ('usage', 'Usage')]
    
    report_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    generated_by = models.ForeignKey(Admin, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Policy(models.Model):
    policy_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    last_updated = models.DateTimeField(auto_now=True)

class HostelApproval(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    approval_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    comments = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


