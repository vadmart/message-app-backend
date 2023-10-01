import os
from channels.routing import ProtocolTypeRouter, URLRouter
from chating.middlewares import WebsocketJWTAuthMiddleware
from chating import routing
from .asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "messenger.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": WebsocketJWTAuthMiddleware(URLRouter(routing.websocket_patterns))
})
