from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken, AuthenticationFailed
from message_app.auth.verify.serializers import TokenSerializer
from django.contrib.auth import authenticate
from rest_framework import status, views
from rest_framework.response import Response
from . import otp


class UserVerifyView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        user = authenticate(**request.data)
        if user is None:
            raise AuthenticationFailed
        serializer: TokenSerializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        if not otp.verify(otp=request.data.get("otp")):
            return Response(data={"detail": "OTP code is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data=serializer.validated_data, status=status.HTTP_200_OK)


class UserVerifyResendView(views.APIView):
    def post(self, request):
        user = authenticate(**request.data)
        if user is None:
            raise AuthenticationFailed
        print(otp.now())
        return Response(data=status.HTTP_200_OK)
