from django.contrib.auth.backends import ModelBackend, UserModel
from message_app.auth.user.models import User
import pyotp


class MessengerModelBackend(ModelBackend):
    def authenticate(self, request, username=None, phone_number=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or phone_number is None:
            return
        try:
            user = User.objects.get(username=username, phone_number=phone_number)
        except User.DoesNotExist:
            User().set_password("ASDFafqw214asdqwdasd")
        else:
            if self.user_can_authenticate(user):
                return user
