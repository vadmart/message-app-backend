import os
from copy import deepcopy
from typing import Any
from collections.abc import Iterable
import requests
from message_app.chating.models import Message, User
import logging

logger = logging.getLogger(__name__)


class OneSignalPushNotifications:
    BASE_URL = "https://onesignal.com/api/v1/notifications/"

    headers: dict[str, str] = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": f"Basic {os.environ.get('ONESIGNAL_REST_API_KEY')}"
    }
    payload: dict[str, Any] = {
        "app_id": "f3536252-f32f-4823-9115-18b1597b3b1a",
        "target_channel": "push"
    }

    def send_push_message(self, message: Message) -> None:
        current_payload = deepcopy(self.payload)
        subscription_ids = [str(message.chat.first_user.public_id), str(message.chat.second_user.public_id)]
        current_payload["include_aliases"] = {"external_id": subscription_ids}
        current_payload["contents"] = {"en": message.content}
        current_payload["headings"] = {"en": message.sender.username}
        current_payload["data"] = {"chat": str(message.chat.public_id),
                                   "created_at": str(message.created_at),
                                   "sender": message.sender.username,
                                   "edited_at": str(message.edited_at),
                                   "is_read": message.is_read,
                                   "file": message.file.name}
        print("Include_aliases:", subscription_ids)
        res = requests.post(self.BASE_URL, json=current_payload, headers=self.headers)
        print(res)

    def send_notification(self, user: User, content: dict) -> None:
        current_payload = deepcopy(self.payload)
        subscription_id = [str(user.public_id)]
        current_payload["include_aliases"] = {"external_id": subscription_id}
        current_payload["contents"] = {"en": content}
        requests.post(self.BASE_URL, json=current_payload, headers=self.headers)
