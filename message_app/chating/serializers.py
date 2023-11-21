from rest_framework import serializers
from message_app.auth.user.models import User
from message_app.chating.models import Message, Chat
from django.db.models import Q


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="public_id", many=False)
    chat = serializers.SlugRelatedField(queryset=Chat.objects.all(), slug_field="public_id", many=False)

    class Meta:
        model = Message
        fields = ["public_id", "sender", "chat", "content", "created_at", "edited_at", "is_read"]
        # read_only_fields = ["public_id", "created_at", "edited_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["sender"] = User.objects.get(public_id=rep["sender"]).username
        return rep


class ChatSerializer(serializers.ModelSerializer):
    first_user = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="username", many=False)
    second_user = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="username", many=False)

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

# "2023-10-15T15:40:19.209225Z"
