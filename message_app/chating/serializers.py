from rest_framework import serializers
from django.shortcuts import get_object_or_404
from message_app.auth.user.models import User
from message_app.auth.user.serializers import UserSerializer
from message_app.chating.models import Message, Chat
from django.db.models import Q


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    chat = serializers.SlugRelatedField(queryset=Chat.objects.all(), slug_field="public_id", many=False)

    class Meta:
        model = Message
        exclude = ["id", "edited_at"]

    def save(self, **kwargs):
        kwargs["sender"] = self.context["request"].user
        return super().save(**kwargs)


class ChatSerializer(serializers.ModelSerializer):
    first_user = UserSerializer(read_only=True)
    second_user = UserSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = ["public_id", "first_user", "second_user", "created_at"]
        read_only_fields = ["public_id", "created_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        last_message = Message.objects.filter(chat__public_id=rep["public_id"]).first()
        rep["last_message"] = MessageSerializer(last_message).data
        rep["unread_messages_count"] = len(Message.objects.filter(Q(chat__public_id=instance.public_id) &
                                                                  Q(is_read=False) &
                                                                  ~Q(sender=self.context["request"].user)))
        return rep

    def save(self, **kwargs):
        kwargs["first_user"] = self.context["request"].user
        kwargs["second_user"] = get_object_or_404(User, username=kwargs.get("second_user"))
        return super().save(**kwargs)

# "2023-10-15T15:40:19.209225Z"
