import onesignal
from onesignal.api import default_api
from onesignal.model.generic_error import GenericError
from onesignal.model.rate_limiter_error import RateLimiterError
from onesignal.model.notification import Notification
from onesignal.model.create_notification_success_response import CreateNotificationSuccessResponse
from pprint import pprint
from onesignal.configuration import Configuration
from message_app.chating.serializers import MessageSerializer, ChatSerializer
from message_app.chating.models import Chat
import os

print(os.environ.get('ONESIGNAL_REST_API_KEY'))
config = Configuration(app_key=os.environ.get('ONESIGNAL_REST_API_KEY'))


def create_message_notification(ms: MessageSerializer, only_for_sender=False):
    if not only_for_sender:
        chat = Chat.objects.get(public_id=ms.data["chat"])
        subscription_ids = [str(chat.first_user.public_id), str(chat.second_user.public_id)]
    else:
        subscription_ids = [str(ms.data["sender"]["public_id"])]
    with onesignal.ApiClient(config) as api_client:
        api_instance = default_api.DefaultApi(api_client)
        content = ms.data.get("content") or "📁File"
        notification = Notification(app_id=os.environ.get("ONESIGNAL_APP_ID"),
                                    include_external_user_ids=subscription_ids,
                                    contents={"en": content},
                                    headings={"en": ms.data["sender"]["username"]},
                                    data={**ms.data, "content": None})

        # example passing only required values which don't have defaults set
        try:
            # Create notification
            api_response = api_instance.create_notification(notification)
            pprint(api_response)
        except onesignal.ApiException as e:
            print("Exception when calling DefaultApi->create_notification: %s\n" % e)


def create_chat_notification(cs: ChatSerializer):
    subscription_ids = [str(cs.data["first_user"]["public_id"]), str(cs.data["second_user"]["public_id"])]
    with onesignal.ApiClient(config) as api_client:
        api_instance = default_api.DefaultApi(api_client)
        notification = Notification(app_id=os.environ.get("ONESIGNAL_APP_ID"),
                                    include_external_user_ids=subscription_ids,
                                    contents={"en": cs.data["last_message"]["content"]},
                                    heading={"en": cs.data["second_user"]["username"]},
                                    data={**cs.data})
        try:
            api_response = api_instance.create_notification(notification)
            pprint(api_response)
        except onesignal.ApiException as e:
            print("Exception when calling DefaultApi->create_notification: %s\n" % e)
