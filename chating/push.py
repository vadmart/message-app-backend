import os
from typing import Any, Iterable
import requests
from chating.models import Replica


class OneSignalPushNotifications:
    BASE_URL = "https://onesignal.com/api/v1/notifications"

    headers: dict[str, str] = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {os.environ.get('ONESIGNAL_REST_API_KEY')}"
    }
    payload: dict[str, Any] = {
        "app_id": "f3536252-f32f-4823-9115-18b1597b3b1a"
    }

    def __init__(self, subscription_id: str, message: str):
        self.subscription_id: str = subscription_id
        self.message: str = message

    def send_notification(self) -> None:
        current_payload = self.payload.copy()
        current_payload["include_subscription_ids"] = [self.subscription_id]
        current_payload["contents"] = {}
        current_payload["contents"]["en"] = self.message
        res = requests.post(self.BASE_URL, json=current_payload)
        print(res)
