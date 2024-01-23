from asgiref.sync import async_to_sync
from channels.consumer import get_channel_layer
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from message_app.auth.user.models import User
from message_app.chating import OneSignal
from message_app.chating.models import Message, Chat
from message_app.chating.serializers import MessageSerializer, ChatSerializer
from message_app.auth.permissions import MessageUserPermission

channel_layer = get_channel_layer()


class ChatViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "delete"]
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer
    lookup_field = "public_id"

    def get_queryset(self):
        return Chat.objects.filter(Q(first_user=self.request.user) | Q(second_user=self.request.user))

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        # for chat in serializer.data:
        #     unread_count = Message.objects.filter(Q(object_id=chat["public_id"]) &
        #                                           ~Q(sender=request.user) &
        #                                           Q(is_read=False)).count()
        #     chat["unread_count"] = unread_count
        return self.get_paginated_response(serializer.data)

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
    permission_classes = [MessageUserPermission]
    lookup_field = "public_id"
    queryset = Message.objects.all()

    def get_queryset(self):
        chat_public_id = self.kwargs.get("chat_public_id")
        return Message.objects.filter(chat__public_id=chat_public_id)

    def create(self, request, *args, **kwargs):
        websocket_data = {"type": "create.message"}
        chat_public_id = self.kwargs.get("chat_public_id")
        serializer = self.get_serializer(data=request.data, context={"request": request, "kwargs": self.kwargs})
        serializer.is_valid(raise_exception=True)
        message = serializer.save(sender=request.user)
        websocket_data["message"] = serializer.data
        async_to_sync(channel_layer.group_send)(chat_public_id,
                                                websocket_data)
        OneSignal.Push.create_message_notification(message=message)
        headers = self.get_success_headers(serializer.data)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        async_to_sync(channel_layer.group_send)(request.data["chat"],
                                                {"type": "update_message",
                                                 "message": serializer.data})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        async_to_sync(channel_layer.group_send)(str(instance.chat.public_id),
                                                {"type": "destroy_message",
                                                 "message": MessageSerializer(instance).data})
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["POST"], detail=True)
    def read(self, request, *args, **kwargs):
        message = get_object_or_404(Message, **kwargs)
        message.is_read = True
        message.save()
        return Response(status=status.HTTP_200_OK)
