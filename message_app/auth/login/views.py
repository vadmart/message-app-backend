import os

import pyotp
from django.contrib.auth.models import AnonymousUser
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from chating.auth.user.models import ChatProfile

from chating.auth.login.serializers import TokenSerializer

otp = pyotp.TOTP(os.environ.get("OTP_HMAC_KEY"))


class UserAuthView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer: TokenSerializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        del serializer.validated_data["user"]
        print(otp.now())
        return Response(data=serializer.validated_data, status=status.HTTP_200_OK)


class UserVerifyView(APIView):
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return Response(data={"data": "User hasn't been authorized"}, status=status.HTTP_401_UNAUTHORIZED)
        if not otp.verify(otp=request.data.get("otp_code")):
            return Response(data={"detail": "OTP code is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
        if request.data.get("one_signal_app_id"):
            ChatProfile.objects.create(user=request.user, one_signal_app_id=request.data["one_signal_app_id"])
        return Response(status=status.HTTP_200_OK)



# TODO: make field "is_verified" and permission.