from django.urls import re_path
from chating import consumers

websocket_patterns = [
    re_path(r"msg/", consumers.MessageConsumer.as_asgi())
]
