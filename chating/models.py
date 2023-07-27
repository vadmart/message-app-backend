from django.db import models
from django.contrib.auth import get_user_model
<<<<<<< HEAD
from chating.abstract.models import AbstractModel
=======
>>>>>>> b52410beaa8ca30b8b27d5e6503d3119fc0bc3e4

User = get_user_model()


<<<<<<< HEAD
class Replica(AbstractModel):
    user_from = models.ForeignKey(to=User, on_delete=models.PROTECT, related_name="replicas_from")
    user_to = models.ForeignKey(to=User, on_delete=models.PROTECT, related_name="replicas_to")
    content = models.TextField()

    def __str__(self):
        return f"From: {self.user_from}, to: {self.user_to}, content: {self.content}"
=======
class Replica(models.Model):
    first_author = models.ForeignKey(to=User, on_delete=models.PROTECT)
    second_author = models.ForeignKey(to=User, on_delete=models.PROTECT)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

>>>>>>> b52410beaa8ca30b8b27d5e6503d3119fc0bc3e4
