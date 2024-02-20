import pyotp
from rest_framework.response import Response
from message_app.auth.user.serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, status
from rest_framework_simplejwt.tokens import RefreshToken
from message_app.auth.user.models import User
from datetime import datetime


class RegisterViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer: UserSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(status=status.HTTP_201_CREATED)
