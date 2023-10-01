from rest_framework_simplejwt.serializers import TokenObtainSerializer
from phonenumber_field.serializerfields import PhoneNumberField


class LoginSerializer(TokenObtainSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["phone_number"] = PhoneNumberField()
        self.fields["password"] = None

    def validate(self, attrs):
        authenticate_kwargs = {
            self.username_field: attrs[self.username_field],
            "phone_number": attrs["phone_number"]
        }
