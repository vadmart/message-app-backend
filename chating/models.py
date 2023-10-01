from django.db import models
from django.contrib.auth import get_user_model
from chating.abstract.models import AbstractModel

User = get_user_model()


class Replica(AbstractModel):
    user_from = models.ForeignKey(to=User, on_delete=models.PROTECT, related_name="replicas_from")
    user_to = models.ForeignKey(to=User, on_delete=models.PROTECT, related_name="replicas_to")
    content = models.TextField()

    def __str__(self):
        return f"From: {self.user_from}, to: {self.user_to}, content: {self.content}"
