from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import Admin

class AdminAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None  # No token provided

        token = auth_header.split(' ')[1]  # Extract the token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            admin_id = payload.get('admin_id')
            if not admin_id:
                return None
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        try:
            admin = Admin.objects.get(admin_id=admin_id)
        except Admin.DoesNotExist:
            raise AuthenticationFailed('Admin not found')

        # ✅ Manually add `is_authenticated` to make DRF permissions work
        admin.is_authenticated = True  

        return (admin, None)  # Return the admin instance
