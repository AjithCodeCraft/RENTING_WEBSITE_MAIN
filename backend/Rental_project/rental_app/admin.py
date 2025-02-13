from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User , Apartment, ApartmentImage,Food


class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'email', 'name', 'phone', 'user_type', 'is_staff', 'is_superuser')
    search_fields = ('email', 'name', 'phone')
    ordering = ('id',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'phone', 'user_type', 'latitude', 'longitude')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'password1', 'password2', 'user_type', 'is_staff', 'is_superuser'),
        }),
    )

admin.site.register(User, CustomUserAdmin)  # ✅ Register custom User model




admin.site.register(Apartment)
admin.site.register(ApartmentImage)
admin.site.register(Food)


