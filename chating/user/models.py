from django.db import models
from phonenumber_field import modelfields
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def create_user(self, phone_number, username, first_name, last_name, avatar):
        if not phone_number:
            raise ValueError(_("Users must have a phone number!"))
        if not username:
            raise ValueError(_("Users must have a username!"))


# Create your models here.
class User(AbstractBaseUser):
    public_id = models.UUIDField()
    phone_number = modelfields.PhoneNumberField(unique=True)
    username = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    avatar = models.ImageField()

    objects = UserManager()
