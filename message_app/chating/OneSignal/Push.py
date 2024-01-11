import os
from pprint import pprint

import onesignal
from onesignal.api import default_api
from onesignal.configuration import Configuration
from onesignal.model.notification import Notification

from message_app.chating.models import Chat, Message

config = Configuration(app_key=os.environ.get('ONESIGNAL_REST_API_KEY'))


def create_message_notification(message: Message):
    chat = message.chat
    subscription_ids = [str(chat.first_user.public_id) if str(message.sender.public_id) != str(chat.first_user.public_id)
                        else str(chat.second_user.public_id)]
    with onesignal.ApiClient(config) as api_client:
        api_instance = default_api.DefaultApi(api_client)
        content = message.content or "Файл"
        notification = Notification(app_id=os.environ.get("ONESIGNAL_APP_ID"),
                                    include_external_user_ids=subscription_ids,
                                    contents={"en": content},
                                    headings={"en": message.sender.username},
                                    data={"chat_id": str(message.chat.public_id)})

        # example passing only required values which don't have defaults set
        try:
            # Create notification
            api_response = api_instance.create_notification(notification)
            pprint(api_response)
        except onesignal.ApiException as e:
            print("Exception when calling DefaultApi->create_notification: %s\n" % e)
