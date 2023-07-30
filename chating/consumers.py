from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from chating.user.models import User
import json
import uuid


class MessageConsumer(AsyncWebsocketConsumer):
    groups = ["general"]

    async def connect(self):
        user = self.scope["user"]
        print(user.public_id, self.channel_name)
        await self.channel_layer.group_add(f"{user.public_id.hex}--client", self.channel_name)
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        user_to = text_data_json["to"]
        content = text_data_json["content"]
        user = await User.objects.async_get_object_by_public_id(public_id=uuid.UUID(user_to))
        await self.channel_layer.group_send(f"{user.public_id.hex}--client", {
            "type": "chat.message",
            "from": {
                "user_uuid": self.scope["user"].public_id.hex
            },
            "message": content
        })
        await self.channel_layer.group_send(f"{self.scope['user'].public_id.hex}--client", {
            "type": "chat.message",
            "from": {
                "user_uuid": self.scope["user"].public_id.hex
            },
            "message": content
        })

    async def chat_message(self, event):
        await self.send(
            json.dumps({
                "from": event["from"],
                "message": event["message"]
            })
        )
