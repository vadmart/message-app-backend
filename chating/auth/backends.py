from django.contrib.auth.backends import ModelBackend
from chating.user.models import User


class MessengerModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, phone_number=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None or phone_number is None:
            return
        try:
            user = User.objects.get_by_natural_key(username=username)
        except User.DoesNotExist:
            User().set_password(password)
        else:
            if user.check_password(password) \
                    and self.user_can_authenticate(user) \
                    and user.phone_number == phone_number:
                return user
