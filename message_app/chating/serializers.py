from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from message_app.auth.user.serializers import UserSerializer
from message_app.chating.models import Message, Chat, GroupChat
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType


class ContentObjectRelatedField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        super().to_internal_value(data)


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    chat = serializers.SlugRelatedField(source="content_object", slug_field="public_id", read_only=True)

    class Meta:
        model = Message
        exclude = ["id", "edited_at"]
        read_only_fields = ["deleted_for_users"]

    def to_representation(self, instance):
        instance = super().to_representation(instance)
        del instance["content_type"]
        del instance["object_id"]
        return instance

    def to_internal_value(self, data):
        if data.get("content") is None and data.get("file[name]") is None:
            raise ValidationError({"errors": ["At least one of content or file is required"]})
        if data.get("chat") is None:
            raise ValidationError({"chat": "This field is required"})
        chat = Chat.objects.filter(public_id=data.get("chat"))
        if chat.exists():
            chat = chat[0]
        else:
            chat = get_object_or_404(GroupChat, public_id=data.get("public_id"))
        content_type = ContentType.objects.get(model=type(chat).__name__.lower(), app_label="message_app_chating")
        data_to_save = {**data, "content_type": content_type.pk, "object_id": chat.pk}
        ret = super().to_internal_value(data_to_save)
        return ret

    def save(self, **kwargs):
        if kwargs.get("sender") is None and self.context.get("request"):
            kwargs["sender"] = self.context["request"].user
        return super().save(**kwargs)


class MessageRelationRelatedField(serializers.RelatedField):

    def to_internal_value(self, data):
        pass


class ChatSerializer(serializers.ModelSerializer):
    first_user = UserSerializer(read_only=True)
    second_user = UserSerializer(read_only=True)
    messages = MessageRelationRelatedField(queryset=Message.objects.all(), many=True)

    class Meta:
        model = Chat
        fields = ["public_id", "first_user", "second_user", "created_at", "messages"]
        read_only_fields = ["public_id", "created_at"]

    def save(self, **kwargs):
        kwargs["first_user"] = self.context["request"].user
        return super().save(**kwargs)

# "2023-10-15T15:40:19.209225Z"
