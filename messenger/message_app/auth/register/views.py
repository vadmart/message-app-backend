from ..verify import otp
from rest_framework.response import Response
from message_app.auth.user.serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, status


class RegisterViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer: UserSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        print(otp.now())
        return Response(status=status.HTTP_200_OK)
