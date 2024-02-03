from asgiref.sync import async_to_sync
from channels.consumer import get_channel_layer
from django.db.models import Q, QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, pagination, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from message_app.auth.user.models import User
from message_app.chating import OneSignal
from message_app.chating.models import Message, Chat
from message_app.chating.serializers import MessageSerializer, ChatSerializer
from message_app.auth.permissions import MessageUserPermission
from rest_framework.reverse import reverse
from django.core.paginator import Paginator

channel_layer = get_channel_layer()


class ChatViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "delete"]
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer
    lookup_field = "public_id"

    def get_queryset(self) -> QuerySet:
        return Chat.objects.filter(Q(first_user=self.request.user) | Q(second_user=self.request.user))

    # def list(self, request, *args, **kwargs):
    #     pass

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
    pagination_class = pagination.CursorPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]
    ordering = "-created_at"

    def get_queryset(self):
        chat_public_id = self.kwargs.get("chat_public_id")
        return Message.objects.filter(chat__public_id=chat_public_id)

    def create(self, request, *args, **kwargs):
        websocket_data = {"type": "create.message"}
        serializer = self.get_serializer(data=request.data, context={"request": request, "kwargs": self.kwargs})
        serializer.is_valid(raise_exception=True)
        message = serializer.save(sender=request.user)
        websocket_data["message"] = serializer.data
        async_to_sync(channel_layer.group_send)(self.kwargs.get("chat_public_id"),
                                                websocket_data)
        OneSignal.Push.create_message_notification(message=message)
        headers = self.get_success_headers(serializer.data)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=partial,
                                         context={"request": request, "kwargs": kwargs})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        async_to_sync(channel_layer.group_send)(self.kwargs.get("chat_public_id"),
                                                {"type": "update_message",
                                                 "message": serializer.data})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        message_data = MessageSerializer(instance).data
        async_to_sync(channel_layer.group_send)(str(instance.chat.get().public_id),
                                                {"type": "destroy_message",
                                                 "message": message_data})
        self.perform_destroy(instance)
        return Response(message_data)

    @action(methods=["POST"], detail=True)
    def read(self, request, *args, **kwargs):
        message = get_object_or_404(Message, **kwargs)
        message.is_read = True
        message.save()
        return Response(status=status.HTTP_200_OK)

    @action(methods=["POST"], detail=False, url_path="read-all-messages")
    def read_all_messages(self, request, *args, **kwargs):
        messages = Message.objects.filter(chat__public_id=kwargs["chat_public_id"])
        for message in messages:
            if self.request.user != message.sender and message.is_read is False:
                message.is_read = True
                message.save()
        return Response(status=status.HTTP_200_OK)
