from datetime import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.test import APIClient
from message_app.chating.models import Chat, Message
from pytz import UTC


# Create your tests here.
class MessageApiTestCase(TestCase):
    def setUp(self) -> None:
        self.u1 = get_user_model().objects.create(phone_number="+380500121234", username="user1")
        self.u2 = get_user_model().objects.create(phone_number="+380500121235", username="user2")
        self.u3 = get_user_model().objects.create(phone_number="+380500121236", username="user3")
        self.first_private_chat = Chat.objects.create(first_user=self.u1, second_user=self.u2)
        self.second_private_chat = Chat.objects.create(first_user=self.u2, second_user=self.u3)
        messages = [
            Message.objects.create(content="TestMessage1", sender=self.u1, content_object=self.first_private_chat),
            Message.objects.create(content="TestMessage2", sender=self.u2, content_object=self.first_private_chat)
        ]
        self.message_lookup = {m.public_id: m for m in messages}
        token = AccessToken.for_user(self.u1)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_message_list_for_chat(self):
        response = self.client.get(f"/api/v1/chat/{self.first_private_chat.public_id}/message/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 2)

    def test_message_retrieve_for_chats(self):
        for message in self.message_lookup.values():
            response = self.client.get(f"/api/v1/chat/{self.first_private_chat.public_id}/message/{message.public_id}/")
            data = response.json()
            self.assertEqual(data["public_id"], str(message.public_id))
            self.assertEqual(data["sender"]["public_id"], str(message.sender.public_id))
            self.assertEqual(data["chat"], str(message.content_object.public_id))
            self.assertEqual(data["content"], message.content)
            self.assertEqual(datetime.strptime(data["created_at"],
                                               "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=UTC), message.created_at)
            self.assertEqual(data["is_edited"], message.is_edited)
            self.assertEqual(data["is_read"], message.is_read)
            self.assertEqual(data["file"], message.file)

    def test_message_for_private_chat_create(self):
        message_data = {
            "content": "Hello"
        }
        resp = self.client.post(f"/api/v1/chat/{self.first_private_chat.public_id}/message/", message_data,
                                content_type="multipart/form-data")
        self.assertEqual(resp.status_code, 201)
        message_id = resp.json()["public_id"]
        message = Message.objects.get(public_id=message_id)
        self.assertEqual(message.content, message_data["content"])
        self.assertEqual(message.chat.get(), self.first_private_chat)
        self.assertEqual(message.sender, self.u1)
        self.assertTrue(message.created_at)
        self.assertEqual(message.is_read, False)
        self.assertEqual(message.is_edited, False)
        self.assertEqual(message.file.name, "")

    def test_message_for_group_chat_create(self):
        pass

    def test_message_for_private_chat_unauthenticated_create(self):
        self.client.credentials()
        message_data = {
            "content": "Hello"
        }
        resp = self.client.post(f"/api/v1/chat/{self.first_private_chat.public_id}/message/", message_data)
        self.assertEqual(resp.status_code, 401)

    def test_message_for_someone_elses_chat_create(self):
        message_data = {
            "content": "Hello",
        }
        resp = self.client.post(f"/api/v1/chat/{self.second_private_chat.public_id}/message/", message_data)
        self.assertEqual(resp.status_code, 403)
