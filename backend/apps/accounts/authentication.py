import jwt
import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Invalid token format')
        
        
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        
        
        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')
        
        if not user.is_active:
            raise AuthenticationFailed('User inactive or deleted')
        
        return (user, token)


def generate_jwt_token(user):
    """Generate a JWT token for a user."""
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    
    payload = {
        'user_id': str(user.id),
        'exp': expiration,
        'iat': datetime.datetime.utcnow(),
        'email': user.email 
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token


def validate_token(token):
    """Validate a JWT token."""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def refresh_token(token):
    """Refresh a JWT token."""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False}
        )
        
        
        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return None
        
        return generate_jwt_token(user)
    except jwt.InvalidTokenError:
        return None


def blacklist_token(token):
    """
    Blacklist a JWT token and log the user out.
    This function is not complete and doesn't actually blacklist the token.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False}
        )
        
        print(f"Blacklisting token for user {payload['user_id']}")
        
        from .models import Token
        Token.objects.create(
            user_id=payload['user_id'],
            token=token
        )
        
        return True
    except:
        return False


def extract_user_id(token):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get('user_id')
    except:
        return None
