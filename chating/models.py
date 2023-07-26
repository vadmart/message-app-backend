from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Replica(models.Model):
    first_author = models.ForeignKey(to=User, on_delete=models.PROTECT)
    second_author = models.ForeignKey(to=User, on_delete=models.PROTECT)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

