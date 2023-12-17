from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response

from message_app.chating.models import Message, Chat
from message_app.auth.user.models import User
from message_app.chating.serializers import MessageSerializer, ChatSerializer
from message_app.chating import OneSignal
from django.db.models import Q
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404


class ChatViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "post", "delete"]
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        return Chat.objects.filter(Q(first_user=self.request.user) | Q(second_user=self.request.user))

    # TODO: rethink logic of creating message after chat's creating
    def create(self, request, *args, **kwargs):
        if not request.data.get("content") and not request.data.get("second_user"):
            return Response("You cannot create chat without creating message", status=status.HTTP_400_BAD_REQUEST)
        second_user = User.objects.get(username=request.data.get("second_user"))
        serializer = self.get_serializer(data={"second_user": second_user})
        serializer.is_valid(raise_exception=True)
        chat = serializer.save(second_user=second_user)
        Message.objects.create(chat=chat, sender=request.user, content=request.data.get("content"))
        OneSignal.Push.create_chat_notification(cs=serializer)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False)
    def get_chat_by_user(self, request):
        phone_number = request.query_params.get("phone_number")
        if not phone_number:
            return Response(data={"detail": "The query parameter 'phone_number' is unfilled!"},
                            status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, phone_number=phone_number)
        chats = (Chat.objects.filter(first_user=self.request.user, second_user=user) |
                 Chat.objects.filter(first_user=user, second_user=self.request.user))
        if not chats.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(chats[0])
        return Response(data=serializer.data, status=status.HTTP_200_OK)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    http_method_names = ["get", "post", "patch", "put", "delete"]
    permission_classes = [IsAuthenticated]
    lookup_field = "public_id"

    def get_queryset(self):
        chat_id = self.request.query_params.get("chat_id")
        return Message.objects.filter(chat__public_id=chat_id)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        OneSignal.Push.create_message_notification(ms=serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=["POST"], detail=True)
    def read(self, request, *args, **kwargs):
        message = get_object_or_404(Message, **kwargs)
        message.is_read = True
        message.save()
        return Response(status=status.HTTP_200_OK)
