"""
ASGI config for messenger project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os
from configurations import importer
from channels.layers import get_channel_layer
from configurations.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

from message_app import urls
from message_app.chating.middlewares import WebsocketJWTAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'messenger.settings')
os.environ.setdefault('DJANGO_CONFIGURATION', 'Dev')

importer.install()


django_asgi_application = get_asgi_application()


application = ProtocolTypeRouter(
    {
        "http": django_asgi_application,
        "websocket": WebsocketJWTAuthMiddleware(URLRouter(urls.websocket_patterns))
    }
)

channel_layer = get_channel_layer()
