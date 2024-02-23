import json
import logging
from collections.abc import Coroutine

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet

from message_app.auth.user.models import User
from message_app.chating.models import Chat

logger = logging.getLogger(__name__)


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
    users_online = 0

    @staticmethod
    def print_users_online():
        print(f"Active connections: {MessageConsumer.users_online}")

    async def connect(self):
        await self.accept()
        if isinstance(self.scope["user"], AnonymousUser):
            await self.send(text_data=json.dumps({"detail": "Your token is invalid or this user does not exist!"}))
            await self.close()
            return
        await self.channel_layer.group_add(str(self.scope["user"].public_id), self.channel_name)
        logger.info(f"{self.scope['user']} connected by WebSocket")
        chats = await get_chats_by_user(self.scope["user"])
        async for chat in chats:
            await self.channel_layer.group_add(str(chat.public_id), self.channel_name)
        MessageConsumer.users_online += 1
        self.print_users_online()

    async def create_message(self, event):
        print("Start sending for user: " + str(self.scope["user"].public_id))
        if event["exclude_user_id"] == str(self.scope["user"].public_id):
            return
        await self.send(
            text_data=json.dumps({
                "action": "create",
                "message": event["message"]
            })
        )

    async def update_message(self, event):
        if event["exclude_user_id"] == str(self.scope["user"].public_id):
            return
        await self.send(
            json.dumps({
                "message": event["message"],
                "action": "update"
            })
        )

    async def destroy_message(self, event):
        if event["exclude_user_id"] == str(self.scope["user"].public_id):
            return
        await self.send(
            json.dumps({
                "message": event["message"],
                "action": "destroy"
            })
        )

    async def get_chats(self, event):
        await self.send(
            json.dumps({
                "data": event["data"]
            })
        )

    async def create_chat(self, event):
        await self.channel_layer.group_add(event["chat"]["public_id"], self.channel_name)
        if event["exclude_user_id"] == str(self.scope["user"].public_id):
            return
        event["chat"]["messages"]["unread_messages_count"] = 1
        event["chat"]["messages"]["has_unread_messages"] = True
        await self.send(
            json.dumps({
                "chat": event["chat"],
                "action": "create"
            })
        )

    async def add_to_group(self, event):
        await self.channel_layer.group_add(event["chat_id"], self.channel_name)

    async def destroy_chat(self, event):
        if event["exclude_user_id"] == str(self.scope["user"].public_id):
            return
        await self.send(
            json.dumps({
                "chat": event["chat"],
                "action": "destroy"
            })
        )

    async def disconnect(self, code):
        logger.info(f"{self.scope['user']} disconnected from WebSocket")
        chats = await get_chats_by_user(self.scope["user"])
        async for chat in chats:
            await self.channel_layer.group_discard(str(chat.public_id), self.channel_name)
        MessageConsumer.users_online -= 1
        self.print_users_online()
