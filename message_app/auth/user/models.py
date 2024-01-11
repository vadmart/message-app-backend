from django.db import models
from phonenumber_field import modelfields
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from message_app.abstract.models import AbstractModel, AbstractManager
from pyotp import random_base32
from django.utils.translation import gettext_lazy as _


def user_directory_path(instance, filename: str) -> str:
    return f"{instance.user.id}/{filename}"


class UserManager(AbstractManager, BaseUserManager):
    def create_user(self, phone_number, username, **kwargs):
        if not phone_number:
            raise ValueError(_("User must have a phone number!"))
        if not username:
            raise ValueError(_("User must have a username!"))
        user = self.model(username=username,
                          phone_number=phone_number,
                          **kwargs)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, username, **kwargs):
        if not phone_number:
            raise ValueError(_("Superuser must have a phone number!"))
        if not username:
            raise ValueError(_("Superuser must have a username!"))
        user = self.model(username=username,
                          phone_number=phone_number,
                          **kwargs)
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, AbstractModel):
    phone_number = modelfields.PhoneNumberField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    avatar = models.ImageField(upload_to=user_directory_path, null=True, blank=True)
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    password = None

    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()
    USERNAME_FIELD = "username"

    def __str__(self):
        return self.username


class ChatProfile(AbstractModel):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    one_signal_app_id = models.CharField(max_length=36)
