from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response

from message_app.chating.models import Message, Chat
from message_app.chating.serializers import MessageSerializer, ChatSerializer
from message_app.chating.push import OneSignalPushNotifications
from django.db.models import Q


class ChatViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "delete"]
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        qs = Chat.objects.filter(Q(first_user=self.request.user) | Q(second_user=self.request.user))
        return sorted(qs, key=lambda chat: chat.message_set.first().created_at, reverse=True)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    http_method_names = ["get", "post", "patch", "put", "delete"]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chat_id = self.request.query_params["chat_id"]
        return Message.objects.filter(chat__public_id=chat_id).order_by("created_at")

    def create(self, request, *args, **kwargs):
        creation_data = {"content": request.data["content"], "chat": request.data["chat"],
                         "sender": request.user.public_id}
        serializer = self.get_serializer(data=creation_data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        self.__send_push_notification(message=message)
        headers = self.get_success_headers(serializer.data)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def __send_push_notification(self, message: Message):
        push_notification = OneSignalPushNotifications(
            subscription_ids=[str(message.chat.first_user.public_id), str(message.chat.second_user.public_id)],
            message=message)
        push_notification.send_notification()
