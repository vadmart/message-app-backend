from django.db.models import QuerySet
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from chating.models import Replica
from chating.serializers import ReplicaSerializer
from chating.push import OneSignalPushNotifications


class ChatViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]
    permission_classes = [IsAuthenticated]
    serializer_class = ReplicaSerializer

    def get_queryset(self):
        print(f"I'm {self.request.user}")
        queryset_user_from = Replica.objects.filter(user_from=self.request.user)
        queryset_user_to = Replica.objects.filter(user_to=self.request.user)
        merged_qs = queryset_user_from | queryset_user_to
        # prepared_messages = self.__prepare_recent_messages(queryset_user_to, queryset_user_from)
        print(merged_qs)
        # serializer.is_valid()
        return merged_qs

    @staticmethod
    def __prepare_recent_messages(first_replicas_collection: QuerySet,
                                  second_replicas_collection: QuerySet) -> QuerySet[Replica] | list[Replica]:
        prepared_messages = []
        if not first_replicas_collection:
            return second_replicas_collection
        elif not second_replicas_collection:
            return first_replicas_collection
        for first, second in zip(first_replicas_collection, second_replicas_collection):
            if first.user_from == second.user_to:
                if first.created_at > second.created_at:
                    prepared_messages.append(first)
                else:
                    prepared_messages.append(second)
        return Replica.objects.filter(user_from__in=prepared_messages)


