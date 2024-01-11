import os

import pyotp
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from message_app.auth.user.models import ChatProfile, User

from message_app.auth.login.serializers import TokenSerializer

otp = pyotp.TOTP(os.environ.get("OTP_HMAC_KEY"))


class UserAuthView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer: TokenSerializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        request.session["auth"] = serializer.validated_data
        print(otp.now())
        return Response(data={"status": "pending"}, status=status.HTTP_200_OK)


class UserVerifyView(APIView):
    def post(self, request):
        if not request.session.get("auth"):
            return Response(data={"detail": "User is not verified!"}, status=status.HTTP_400_BAD_REQUEST)
        auth_data = request.session["auth"]
        if not otp.verify(otp=request.data.get("otp_code")):
            return Response(data={"detail": "OTP code is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data=auth_data, status=status.HTTP_200_OK)
