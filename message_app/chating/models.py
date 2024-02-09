from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.utils.translation import gettext_lazy as _
from message_app.abstract.models import AbstractModel

User = get_user_model()


def path_upload_to(instance, filename):
    return f"{instance.sender.public_id}/{filename}"


class Message(AbstractModel):
    content_type = models.ForeignKey(to=ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey()
    sender = models.ForeignKey(to=User, on_delete=models.CASCADE)
    content = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to=path_upload_to, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    deleted_for_users = models.ManyToManyField(to=User, related_name="deleted_messages")

    def __str__(self):
        return f"Sender: {self.sender}, content: {self.content}"

    def save(self, *args, **kwargs):
        if self.pk:
            self.edited_at = timezone.now()
            self.is_edited = True
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["-created_at"]


class Chat(AbstractModel):
    public_id = models.UUIDField(null=False, unique=True, db_index=True)
    first_user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="first_user")
    second_user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="second_user")
    edited_at = None
    messages = GenericRelation(to=Message, related_query_name="chat")

    class Meta:
        constraints = [models.UniqueConstraint(fields=("first_user", "second_user"),
                                               name="unique_first_and_second_users")]
        ordering = ["-created_at"]


class GroupChat(AbstractModel):
    class ChatType(models.TextChoices):
        USUAL = "usual", _("Звичайний"),
        EXTENDED = "ext", _("Розширений")

    creator = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="created_groupchats")
    name = models.CharField(max_length=30)
    users = models.ManyToManyField(to=User, through="Membership", related_name="groupchats")
    chat_type = models.CharField(choices=ChatType.choices)
    messages = GenericRelation(to=Message, related_query_name="group_chat")
    edited_at = None

    # def clean(self):
    #     if self.users.count() >= 100:
    #         raise ValidationError(
    #             _("У чаті не може бути більше 100 користувачів. Для збільшення ліміту до 500 000 осіб необхідно змінити тип цього чату на розширений"))


class Membership(AbstractModel):
    class UserRole(models.TextChoices):
        USER = "user", _("Користувач")
        ADMIN = "admin", _("Адміністратор")

    group_chat = models.ForeignKey(to=GroupChat, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    user_role = models.CharField(choices=UserRole.choices)
    edited_at = None

    class Meta:
        constraints = [models.UniqueConstraint(fields=("group_chat", "user"),
                                               name="unique_group_chat_and_user")]
