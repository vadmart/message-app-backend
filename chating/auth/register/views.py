import pyotp
from rest_framework.response import Response
from chating.auth.user.serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, status
from rest_framework_simplejwt.tokens import RefreshToken
from chating.auth.user.models import User
from datetime import datetime


class RegisterViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer: UserSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if "otp_code" not in request.data:
            totp = pyotp.TOTP(s=pyotp.random_base32())
            request.session["otp_code"] = totp.now()
            request.session["otp_start_datetime"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
            request.session["otp_interval"] = totp.interval
            print(f"Code for {request.data['phone_number']}: {totp.now()}")
            return Response(data={"status": "pending"}, status=status.HTTP_200_OK)
        else:
            received_otp_code = request.data["otp_code"]
            session_otp_code: pyotp.TOTP = request.session["otp_code"]
            session_otp_start_datetime = datetime.strptime(request.session["otp_start_datetime"],
                                                            "%d/%m/%Y %H:%M:%S")
            session_otp_interval = request.session["otp_interval"]
            if (datetime.now() - session_otp_start_datetime).seconds > session_otp_interval:
                return Response(data={"error": "Otp code is expired! Get new one"}, status=status.HTTP_400_BAD_REQUEST)
            if received_otp_code != session_otp_code:
                return Response(data={"error": "Otp code is invalid!"}, status=status.HTTP_400_BAD_REQUEST)
        del request.session["otp_code"]
        del request.session["otp_start_datetime"]
        del request.session["otp_interval"]
        self.perform_create(serializer)
        user = User.objects.get(**serializer.validated_data)
        refresh_token = RefreshToken.for_user(user)
        access_token = refresh_token.access_token
        return Response(data={"access": str(access_token),
                              "refresh": str(refresh_token)}, status=status.HTTP_200_OK)
