from django.db import models
from phonenumber_field import modelfields
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from chating.abstract.models import AbstractModel, AbstractManager
from django.utils.translation import gettext_lazy as _


def user_directory_path(instance, filename):
    return f"{instance.user.id}/{filename}"


class UserManager(AbstractManager, BaseUserManager):
    def create_user(self, phone_number, username, password, **kwargs):
        if not phone_number:
            raise ValueError(_("User must have a phone number!"))
        if not username:
            raise ValueError(_("User must have a username!"))
        if not password:
            raise ValueError(_("User must have a password!"))
        user = self.model(username=username,
                          phone_number=phone_number,
                          **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, username, password, **kwargs):
        if not phone_number:
            raise ValueError(_("Superuser must have a phone number!"))
        if not username:
            raise ValueError(_("Superuser must have a username!"))
        if not password:
            raise ValueError(_("Superuser must have a password!"))
        user = self.create_user(phone_number, username, password, **kwargs)
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
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()
    USERNAME_FIELD = "username"

    def __str__(self):
        return self.username
