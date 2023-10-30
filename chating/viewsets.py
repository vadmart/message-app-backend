from uuid import UUID
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response

from chating.auth.user.models import User
from chating.models import Message, Chat
from chating.serializers import MessageSerializer
from chating.push import OneSignalPushNotifications


class ChatViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "delete"]
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        chats = Chat.objects.filter(first_user=self.request.user) | Chat.objects.filter(second_user=self.request.user)
        messages = []
        for chat in chats:
            messages.append(chat.message_set.first())
        messages.sort(key=lambda item: item.created_at, reverse=True)
        return messages


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    http_method_names = ["get", "post", "patch", "put", "delete"]

    def get_queryset(self):
        chat_id = self.request.query_params["chat_id"]
        return Message.objects.filter(chat__public_id=chat_id).order_by("created_at")

    def create(self, request, *args, **kwargs):
        chat = self.__get_chat(sender=request.user,
                               receiver=get_object_or_404(User, public_id=request.data["receiver"]))
        creation_data = {"content": request.data["content"], "chat": chat.public_id,
                         "sender": request.user.public_id}
        serializer = self.get_serializer(data=creation_data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        self.__send_push_notification(message=message)
        headers = self.get_success_headers(serializer.data)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def __send_push_notification(self, message: Message):
        receiver = message.chat.second_user if self.request.user == message.chat.first_user else message.chat.first_user
        push_notification = OneSignalPushNotifications(
            subscription_ids=list(receiver.chatprofile_set.all().values_list("one_signal_app_id", flat=True)),
            message=message)
        push_notification.send_notification()

    def __get_chat(self, sender: User, receiver: User) -> Chat:
        chats = (Chat.objects.filter(first_user=sender, second_user=receiver) |
                 Chat.objects.filter(first_user=receiver, second_user=sender))
        if chats:
            return chats[0]
        return Chat.objects.create(first_user=sender, second_user=receiver)