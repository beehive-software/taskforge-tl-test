from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User, UserProfile, Token
from .serializers import UserSerializer, UserProfileSerializer, LoginSerializer, RegisterSerializer
from .authentication import generate_jwt_token, validate_token, refresh_token

User = get_user_model()

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Login a user and return a JWT token."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        
        user = authenticate(request, username=email, password=password)
        
        if user:
            
            token = generate_jwt_token(user)
            
            Token.objects.create(
                user=user,
                token=token
            )
            
            return Response({
                'token': token,
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Register a new user."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            first_name=serializer.validated_data.get('first_name', ''),
            last_name=serializer.validated_data.get('last_name', '')
        )
        
        UserProfile.objects.create(user=user)
        
        
        token = generate_jwt_token(user)
        
        
        Token.objects.create(
            user=user,
            token=token
        )
        
        return Response({
            'token': token,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def refresh_token_view(request):
    """Refresh a JWT token."""
    
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return Response({
            'error': 'Authorization header missing'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        token = auth_header.split(' ')[1]
    except IndexError:
        return Response({
            'error': 'Invalid token format'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    
    payload = validate_token(token)
    if not payload:
        return Response({
            'error': 'Invalid or expired token'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    
    new_token = refresh_token(token)
    if not new_token:
        return Response({
            'error': 'Failed to refresh token'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    
    try:
        user = User.objects.get(id=payload['user_id'])
        Token.objects.create(
            user=user,
            token=new_token
        )
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'token': new_token
    })


class UserProfileAPIView(APIView):
    """API view for user profile."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user profile."""
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            
            profile = UserProfile.objects.create(user=request.user)
        
        
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile."""
        
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            user = request.user
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            user.save()
            
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAPIView(APIView):
    """API view for users."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id=None):
        """Get user details."""
        if user_id:
            
            user = get_object_or_404(User, id=user_id)
        else:
            
            user = request.user
        
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def patch(self, request, user_id=None):
        """Update user details."""
        
        if user_id and str(user_id) != str(request.user.id):
            return Response({
                'error': 'You cannot update other users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    """Logout a user."""
    
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return Response({
            'error': 'Authorization header missing'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        token = auth_header.split(' ')[1]
    except IndexError:
        return Response({
            'error': 'Invalid token format'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    
    Token.objects.filter(token=token).delete()
    
    return Response({
        'message': 'Logged out successfully'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password."""
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    
    if not old_password:
        return Response({
            'error': 'Old password is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not new_password:
        return Response({
            'error': 'New password is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    
    user = request.user
    if not user.check_password(old_password):
        return Response({
            'error': 'Incorrect old password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    
    user.set_password(new_password)
    user.save()
    
    Token.objects.filter(user=user).delete()
    
    
    token = generate_jwt_token(user)
    
    
    Token.objects.create(
        user=user,
        token=token
    )
    
    return Response({
        'token': token,
        'message': 'Password changed successfully'
    })