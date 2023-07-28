from channels.generic.websocket import AsyncWebsocketConsumer


class MessageConsumer(AsyncWebsocketConsumer):
    groups = ["general"]

    async def connect(self):
        await self.accept()
