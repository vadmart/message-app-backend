import json
from collections.abc import Coroutine

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet

from message_app.auth.user.models import User
from message_app.chating.models import Chat
from message_app.chating.serializers import ChatSerializer


def filter_chats_by_user(user: User) -> QuerySet[Chat]:
    return Chat.objects.filter(first_user=user) | Chat.objects.filter(second_user=user)


@database_sync_to_async
def aget_chat(sender: User, receiver: User) -> Coroutine:
    chats = (Chat.objects.filter(first_user=sender, second_user=receiver) |
             Chat.objects.filter(first_user=receiver, second_user=sender))
    if not chats:
        chats = QuerySet(Chat.objects.create(first_user=sender, second_user=receiver))
    return chats[0]


@database_sync_to_async
def get_chats_by_user(user: User) -> QuerySet[Chat]:
    return (Chat.objects.filter(first_user=user) |
            Chat.objects.filter(second_user=user))


class MessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        if isinstance(self.scope["user"], AnonymousUser):
            await self.send(text_data=json.dumps({"detail": "Your token is invalid or this user does not exist!"}))
            await self.close()
            return
        chats = await get_chats_by_user(self.scope["user"])
        async for chat in chats:
            await self.channel_layer.group_add(str(chat.public_id), self.channel_name)
        await self.send(text_data=json.dumps(
            {"chats": await database_sync_to_async(lambda: ChatSerializer(chats, many=True).data)()}))

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json.get("action")
        chat_id = text_data_json.get("chat_id")
        if action is None or chat_id is None:
            await self.send(text_data=json.dumps({"detail": "Both action and chat_id must be set!"}))
            return

    async def create_message(self, event):
        print(f"Sending message")
        await self.send(
            text_data=json.dumps({
                "action": "create",
                **({"message": event["message"]} if "message" in event else {"chat": event["chat"]})
                # "message": event["message"],
            })
        )

    async def update_message(self, event):
        await self.send(
            json.dumps({
                "message": event["message"],
                "action": "update"
            })
        )

    async def get_chats(self, event):
        print(event)
        await self.send(
            json.dumps({
                "data": event["data"]
            })
        )

    async def disconnect(self, code):
        chats = await get_chats_by_user(self.scope["user"])
        async for chat in chats:
            await self.channel_layer.group_discard(str(chat.public_id), self.channel_name)
