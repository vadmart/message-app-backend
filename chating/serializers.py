from rest_framework import serializers
from chating.auth.user.models import User
from chating.models import Message, Chat


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="public_id", many=False)
    chat = serializers.SlugRelatedField(queryset=Chat.objects.all(), slug_field="public_id", many=False)

    class Meta:
        model = Message
        fields = ["public_id", "sender", "chat", "content", "created_at", "edited_at"]
        # read_only_fields = ["public_id", "created_at", "edited_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["sender"] = User.objects.get(public_id=rep["sender"]).username
        return rep
