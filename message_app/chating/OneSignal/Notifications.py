import os
from copy import deepcopy
from typing import Any
from .__config import BASE_URL
import requests
from message_app.chating.models import Message, User
import logging

logger = logging.getLogger(__name__)

NOTIFICATIONS_URL = f"{BASE_URL}notifications/"

headers: dict[str, str] = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": f"Basic {os.environ.get('ONESIGNAL_REST_API_KEY')}"
}


def send_push_message(message: Message) -> None:
    payload: dict[str, Any] = {
        "app_id": "f3536252-f32f-4823-9115-18b1597b3b1a",
        "target_channel": "push"
    }
    subscription_ids = [str(message.chat.first_user.public_id), str(message.chat.second_user.public_id)]
    payload["include_aliases"] = {"external_id": subscription_ids}
    payload["contents"] = {"en": message.content}
    payload["headings"] = {"en": message.sender.username}
    payload["data"] = {"public_id": str(message.public_id),
                       "chat": str(message.chat.public_id),
                       "sender": message.sender.username,
                       "created_at": str(message.created_at),
                       "is_edited": message.is_edited,
                       "is_read": message.is_read,
                       "file": message.file.name}
    print("Include_aliases:", subscription_ids)
    res = requests.post(NOTIFICATIONS_URL,
                        json=payload,
                        headers=headers)
    print(res)


def send_notification(self, user: User, content: dict) -> None:
    current_payload = deepcopy(self.payload)
    subscription_id = [str(user.public_id)]
    current_payload["include_aliases"] = {"external_id": subscription_id}
    current_payload["contents"] = {"en": content}
    requests.post(self.BASE_URL, json=current_payload, headers=self.headers)
