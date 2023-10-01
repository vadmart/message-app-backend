from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet

from chating.auth.user.models import User, ChatProfile
import json
import uuid
import json
from chating.push import OneSignalPushNotifications
from channels.db import database_sync_to_async

from chating.models import Replica
from asgiref.sync import sync_to_async


def filter_replicas_by_user(user: User) -> QuerySet[Replica]:
    return Replica.objects.filter(user_from=user) | Replica.objects.filter(user_to=user)


@database_sync_to_async
def aget_onesignal_id_by_user(user: User) -> str:
    return user.chatprofile.one_signal_app_id


class MessageConsumer(AsyncWebsocketConsumer):
    groups = ["general"]

    async def connect(self):
        await self.accept()
        user = self.scope["user"]
        if isinstance(user, AnonymousUser):
            await self.send(text_data=json.dumps({"detail": "Your token is invalid or this user does not exist."}))
            await self.close()
            return
        print(user.public_id, self.channel_name)
        await self.channel_layer.group_add(f"{user.public_id.hex}--client", self.channel_name)
        # replicas = filter_replicas_by_user(user=user)
        # async for replica in replicas:
        #     await self.channel_layer.group_send(f"{user.public_id.hex}--client", {
        #         "type": "chat.message",
        #         "from": (await sync_to_async(replica.user_from)()).public_id.hex,
        #         "message": replica.content
        #     })

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        user_to_id = text_data_json["to"]
        content = text_data_json["content"]
        user_to = await User.objects.aget_object_by_public_id(public_id=uuid.UUID(user_to_id))
        await Replica.objects.acreate(user_from=self.scope["user"], user_to=user_to, content=content)
        push_notification = OneSignalPushNotifications(subscription_id=await aget_onesignal_id_by_user(user_to),
                                                       message=content)
        push_notification.send_notification()
        await self.channel_layer.group_send(f"{user_to_id}--client", {
            "type": "chat.message",
            "from": user_to_id,
            "message": content
        })
        # await self.channel_layer.group_send(f"{self.scope['user'].public_id.hex}--client", {
        #     "type": "chat.message",
        #     "from": {
        #         "user_uuid": self.scope["user"].public_id.hex
        #     },
        #     "message": content
        # })

    async def chat_message(self, event):
        print(event)
        await self.send(
            json.dumps({
                "from": event["from"],
                "message": event["message"]
            })
        )
