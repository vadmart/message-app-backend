from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from message_app.auth.user.models import User
from message_app.auth.user.serializers import UserSerializer
from message_app.chating.models import Message, Chat
from django.db.models import Q


class ChatRelatedField(serializers.SlugRelatedField):
    def __init__(self, **kwargs):
        super(ChatRelatedField, self).__init__("public_id", **kwargs)

    def to_representation(self, obj):
        return str(super().to_representation(obj))


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    chat = ChatRelatedField(queryset=Chat.objects.all(), many=False)

    class Meta:
        model = Message
        exclude = ["id", "edited_at"]
        write_only_fields = ["chat"]

    # def to_internal_value(self, data):
    #     if data.get("content") is None and data.get("file[name]") is None:
    #         raise ValidationError("At least one of content or file is required")
    #     return super().to_internal_value(data)

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
                                                                  ~Q(sender=self.context["request"].user))) \
            if self.context.get("request") else 0
        return rep

    def save(self, **kwargs):
        kwargs["first_user"] = self.context["request"].user
        return super().save(**kwargs)

# "2023-10-15T15:40:19.209225Z"
