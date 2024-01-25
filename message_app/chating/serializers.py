from django.http import QueryDict
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from message_app.auth.user.serializers import UserSerializer
from message_app.chating.models import Message, Chat
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q


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
        instance["chat"] = str(instance["chat"])
        del instance["content_type"]
        del instance["object_id"]
        return instance

    def validate(self, data):
        if "content" not in data and "file" not in data:
            raise ValidationError("At least one of content or file is required")
        return super().validate(data)

    def to_internal_value(self, data):
        if isinstance(data, QueryDict):
            data = data.dict()
        chat = Chat.objects.get(public_id=self.context["kwargs"]["chat_public_id"])
        content_type = ContentType.objects.get_for_model(Chat)
        data_to_save = {**data,
                        "content_type": content_type.pk,
                        "object_id": chat.pk}
        return super().to_internal_value(data_to_save)


class MessageRelationRelatedField(serializers.RelatedField):

    def to_internal_value(self, data):
        pass


class ChatSerializer(serializers.ModelSerializer):
    first_user = UserSerializer(read_only=True)
    second_user = UserSerializer(read_only=True)
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        exclude = ["id", "created_at"]
        read_only_fields = ["public_id", "created_at"]

    def save(self, **kwargs):
        kwargs["first_user"] = self.context["request"].user
        return super().save(**kwargs)

    def get_messages(self, obj):
        messages = Message.objects.filter(chat__public_id=obj.public_id)
        return {"results": MessageSerializer(messages[:5][::-1],
                                             many=True).data,
                "unread_messages_count": Message.objects.filter(~Q(sender=self.context["request"].user) &
                                                                Q(is_read=False)).count()}

# "2023-10-15T15:40:19.209225Z"
