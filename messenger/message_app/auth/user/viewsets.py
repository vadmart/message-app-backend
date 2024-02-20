from django.contrib.auth import get_user_model
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from message_app.chating.models import Chat
from django.shortcuts import redirect, reverse
from message_app.auth.user.models import User

from message_app.auth.user.serializers import UserSerializer


# User = get_user_model()


# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    http_method_names = ["get"]
    lookup_field = "phone_number"
    queryset = User.objects.all()

    # def get_queryset(self) -> User | QuerySet[User]:
    #     """Function will return only one contact, if user provides the 'phone_number' query param, otherwise - all
    #     users
    #     @:returns - User object or QuerySet[User]"""
    #     if self.request.query_params:
    #         return get_object_or_404(User, phone_number=self.request.query_params["phone_number"])
    #     return User.objects.all()
