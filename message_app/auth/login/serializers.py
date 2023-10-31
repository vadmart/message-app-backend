from rest_framework_simplejwt import exceptions
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework.serializers import Serializer
from phonenumber_field import serializerfields
from rest_framework_simplejwt.tokens import RefreshToken, Token
from rest_framework_simplejwt.settings import api_settings
from phonenumber_field.serializerfields import PhoneNumberField
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login


class AbstractTokenSerializer(TokenObtainSerializer):
    phone_number = PhoneNumberField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        del self.fields["password"]
        self.fields["phone_number"] = serializerfields.PhoneNumberField()

    def validate(self, attrs):
        authenticate_kwargs = {
            self.username_field: attrs[self.username_field],
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
        return {"user": self.user}


class TokenSerializer(AbstractTokenSerializer):
    token_class = RefreshToken

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)
        return data
