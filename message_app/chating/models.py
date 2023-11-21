from django.db import models
from django.contrib.auth import get_user_model
from message_app.abstract.models import AbstractModel

User = get_user_model()


def path_upload_to(instance, filename):
    return f"{instance.sender.id}/{filename}"


class Chat(AbstractModel):
    first_user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="first_user")
    second_user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="second_user")

    class Meta:
        unique_together = ["first_user", "second_user"]


class Message(AbstractModel):
    chat = models.ForeignKey(to=Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(to=User, on_delete=models.CASCADE)
    content = models.TextField()
    file = models.FileField(upload_to=path_upload_to, null=True, blank=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Sender: {self.sender}, content: {self.content}"

    class Meta:
        ordering = ["-created_at"]
