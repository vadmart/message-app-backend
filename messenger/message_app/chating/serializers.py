from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from message_app.auth.user.serializers import UserSerializer
from message_app.chating.models import Message, Chat, User, GroupChat


class ContentObjectRelatedField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        super().to_internal_value(data)


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    chat = serializers.SlugRelatedField(source="content_object", slug_field="public_id", read_only=True)

    class Meta:
        model = Message
        exclude = ["id", "edited_at", "content_type", "object_id"]
        read_only_fields = ["deleted_for_users"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["chat"] = str(rep["chat"])
        return rep

    def validate(self, data):
        if "content" not in data and "file" not in data:
            raise ValidationError("At least one of content or file is required")
        return super().validate(data)

    def create(self, validated_data):
        chats = Chat.objects.filter(public_id=validated_data["chat"])
        if not chats.exists():
            chat = get_object_or_404(GroupChat, public_id=validated_data["chat"])
        else:
            chat = chats[0]
        validated_data["content_object"] = chat
        del validated_data["chat"]
        return super().create(validated_data)


class ChatSerializer(serializers.ModelSerializer):
    first_user = UserSerializer(read_only=True)
    second_user = serializers.SlugRelatedField(slug_field="public_id", queryset=User.objects.all())
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        exclude = ["id", "created_at"]

    def save(self, **kwargs):
        kwargs["first_user"] = self.context["request"].user
        return super().save(**kwargs)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        second_user = User.objects.get(public_id=ret["second_user"])
        ret["second_user"] = UserSerializer(second_user).data
        return ret

    def get_messages(self, obj):
        messages = Message.objects.filter(chat__public_id=obj.public_id)
        filtered_messages = messages.filter(~Q(sender=self.context["request"].user) &
                                            Q(is_read=False))
        return {
            "results": MessageSerializer(messages[:5][::-1], many=True).data,
            "unread_messages_count": filtered_messages.count(),
            "has_unread_messages": filtered_messages.exists()
        }

# "2023-10-15T15:40:19.209225Z"
