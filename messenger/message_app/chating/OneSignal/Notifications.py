import os
from copy import deepcopy
from typing import Any
from .__config import BASE_URL
import requests
from message_app.chating.models import User, Chat
import logging
from message_app.auth.user.serializers import UserSerializer
from message_app.chating.serializers import MessageSerializer

logger = logging.getLogger(__name__)

NOTIFICATIONS_URL = f"{BASE_URL}notifications/"

headers: dict[str, str] = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": f"Basic {os.environ.get('ONESIGNAL_REST_API_KEY')}"
}


def send_push_message(ms: MessageSerializer) -> None:
    payload: dict[str, Any] = {
        "app_id": "f3536252-f32f-4823-9115-18b1597b3b1a",
        "target_channel": "push"
    }
    chat = Chat.objects.get(public_id=ms.data["chat"])
    subscription_ids = [str(chat.first_user.public_id), str(chat.second_user.public_id)]
    payload["include_aliases"] = {"external_id": subscription_ids}
    payload["contents"] = {"en": ms.data["content"]}
    payload["headings"] = {"en": ms.data["sender"]["username"]}
    payload["data"] = {**ms.data, "chat": str(ms.data["chat"]), "content": None}
    print("Include_aliases:", subscription_ids)
    res = requests.post(NOTIFICATIONS_URL,
                        json=payload,
                        headers=headers)
    print(res)
    print(res.content)


def send_notification(self, user: User, content: dict) -> None:
    current_payload = deepcopy(self.payload)
    subscription_id = [str(user.public_id)]
    current_payload["include_aliases"] = {"external_id": subscription_id}
    current_payload["contents"] = {"en": content}
    requests.post(self.BASE_URL, json=current_payload, headers=self.headers)
