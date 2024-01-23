import asyncio

from channels.testing import WebsocketCommunicator, ChannelsLiveServerTestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.test import RequestsClient
from asgiref.sync import sync_to_async
from message_app.chating.models import Chat
from messenger.asgi import application


class WebSocketTestCase(ChannelsLiveServerTestCase):

    def setUp(self) -> None:
        self.u1 = get_user_model().objects.create(username="testuser", phone_number="+380500000000")
        self.u2 = get_user_model().objects.create(username="testuser2", phone_number="+380660000000")
        self.u3 = get_user_model().objects.create(username="testuser3", phone_number="+380680000000")
        self.chat = Chat.objects.create(first_user=self.u1, second_user=self.u2)
        self.token1 = AccessToken.for_user(self.u1)
        self.token2 = AccessToken.for_user(self.u2)
        self.token3 = AccessToken.for_user(self.u3)
        self.client = RequestsClient()
        self.client.headers["Authorization"] = f"Bearer {self.token1}"

    async def test_websocket_connect(self):
        communicator = WebsocketCommunicator(application,
                                             self.live_server_ws_url + f"/ws/chat/?token={self.token1}")
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_websocket_after_message_create(self):
        communicator1 = WebsocketCommunicator(application,
                                              self.live_server_ws_url + f"/ws/chat/?token={self.token1}")
        connected1, subprotocol1 = await communicator1.connect()
        communicator2 = WebsocketCommunicator(application,
                                              self.live_server_ws_url + f"/ws/chat/?token={self.token2}")
        connected2, subprotocol2 = await communicator2.connect()
        communicator3 = WebsocketCommunicator(application,
                                              self.live_server_ws_url + f"/ws/chat/?token={self.token3}")
        connected3, subprotocol3 = await communicator3.connect()
        self.assertTrue(connected1)
        self.assertTrue(connected2)
        self.assertTrue(connected3)
        message_data = {
            "content": "Test message"
        }
        await sync_to_async(self.client.post)(
            self.live_server_url + f"/api/v1/chat/{self.chat.public_id}/message/",
            message_data)
        ws_frame1 = await communicator1.receive_json_from()
        ws_frame2 = await communicator2.receive_json_from()
        self.assertEqual(ws_frame1["action"], "create")
        self.assertEqual(ws_frame2["action"], "create")
        try:
            await communicator2.receive_from()
            raise Exception("User 3 got message and it's not a correct behaviour!")
        except asyncio.TimeoutError:
            print("There is no message for user 3 and it's correct")
        await communicator1.disconnect()
        await communicator2.disconnect()
        await communicator3.disconnect()
