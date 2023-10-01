from rest_framework import serializers
from chating.models import Replica


class ReplicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Replica
        fields = ["user_from", "user_to", "content", "created_at", "edited_at"]
