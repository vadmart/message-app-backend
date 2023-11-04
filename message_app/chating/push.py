import os
from copy import deepcopy
from typing import Any
from collections.abc import Iterable
import requests
from message_app.chating.models import Message


class OneSignalPushNotifications:
    BASE_URL = "https://onesignal.com/api/v1/notifications/"

    headers: dict[str, str] = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": f"Basic {os.environ.get('ONESIGNAL_REST_API_KEY')}"
    }
    payload: dict[str, Any] = {
        "app_id": "f3536252-f32f-4823-9115-18b1597b3b1a"
    }

    def __init__(self, subscription_ids: Iterable[str], message: Message):
        self.subscription_ids = subscription_ids
        self.message = message

    def send_notification(self) -> None:
        current_payload = deepcopy(self.payload)
        current_payload["include_aliases"] = {"external_id": self.subscription_ids}
        current_payload["contents"] = {"en": f"{self.message.content}"}
        current_payload["headings"] = {"en": self.message.sender.username}
        current_payload["target_channel"] = "push"
        current_payload["data"] = {"chat": str(self.message.chat.public_id),
                                   "created_at": self.message.created_at.strftime("%d.%m.%Y %H:%M"),
                                   "sender": self.message.sender.username,
                                   "edited_at": self.message.edited_at.strftime("%d.%m.%Y %H:%M")}
        res = requests.post(self.BASE_URL, json=current_payload, headers=self.headers)
        print(res.content)
