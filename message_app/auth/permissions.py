from rest_framework import permissions
from rest_framework.exceptions import ValidationError
from message_app.chating.models import Chat, Message


class MessageUserPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.user:
            chat_public_id = request.parser_context["kwargs"].get("chat_public_id")
            chat = Chat.objects.filter(public_id=chat_public_id).first()
            if chat is None:
                return True
            if request.user == chat.first_user or request.user == chat.second_user:
                return True
        return False

    def has_object_permission(self, request, view, obj: Message):
        if request.user:
            chat = obj.chat.get()
            if request.user == chat.first_user or request.user == chat.second_user:
                return True
        return False

