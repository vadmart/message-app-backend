from rest_framework_simplejwt import exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from phonenumber_field.serializerfields import PhoneNumberField
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login


class TokenSerializer(TokenObtainPairSerializer):
    phone_number = PhoneNumberField()

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["user_id"] = user.public_id.hex
        return token

    def _validate(self, attrs):
        authenticate_kwargs = {
            self.username_field: attrs[self.username_field],
            "password": attrs["password"],
            "phone_number": attrs["phone_number"]
        }

        try:
            authenticate_kwargs["request"] = self.context["request"]
        except KeyError:
            pass

        self.user = authenticate(**authenticate_kwargs)

        if not api_settings.USER_AUTHENTICATION_RULE(self.user):
            raise exceptions.AuthenticationFailed(
                self.error_messages["no_active_account"],
                "no_active_account",
            )
        return {}

    def validate(self, attrs):
        data = self._validate(attrs)
        refresh = self.get_token(user=self.user)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)
        return data
