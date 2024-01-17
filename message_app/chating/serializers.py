from rest_framework.exceptions import ValidationError
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

    class Meta:
        model = Message
        exclude = ["id", "edited_at"]
        write_only_fields = ["chat"]

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        if data.get("content") is None and data.get("file[name]") is None:
            raise ValidationError({"errors": ["At least one of content or file is required"]})
        return ret

    def save(self, **kwargs):
        if kwargs.get("sender") is None and self.context.get("request"):
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
        messages = Message.objects.filter(object_id=rep["public_id"]).first()
        rep["messages"] = [MessageSerializer(messages).data] if messages else []
        return rep

    def save(self, **kwargs):
        kwargs["first_user"] = self.context["request"].user
        return super().save(**kwargs)

# "2023-10-15T15:40:19.209225Z"
