from chating.auth.user.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["public_id", "username", "phone_number", "first_name", "last_name", "email", "avatar",
                  "created_at", "edited_at"]
        read_only_fields = ["public_id", "created_at", "edited_at"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
