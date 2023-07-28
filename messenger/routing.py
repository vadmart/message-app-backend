from channels.routing import ProtocolTypeRouter, URLRouter
from chating.middlewares import WebsocketJWTAuthMiddleware
from chating import routing
from asgi import get_asgi_application

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": WebsocketJWTAuthMiddleware(URLRouter(routing.websocket_patterns))
}
)
