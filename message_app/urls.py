from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from message_app.auth.login.views import UserAuthView
from message_app.auth.verify.views import UserVerifyView
from message_app.auth.register.views import RegisterViewSet
from message_app.chating.viewsets import ChatViewSet, MessageViewSet
from message_app.auth.user.viewsets import UserViewSet
from rest_framework.routers import SimpleRouter
from rest_framework_nested.routers import NestedSimpleRouter
from message_app.chating import consumers

router = SimpleRouter()
router.register("chat", ChatViewSet, basename="chat")
router.register("auth/register", RegisterViewSet, basename="auth-register")
router.register("user", UserViewSet, basename="user")

chat_router = NestedSimpleRouter(router, "chat", lookup="chat")
chat_router.register("message", MessageViewSet, basename="message")


urlpatterns = [
    path("auth/login/", UserAuthView.as_view(), name="auth-login"),
    path("auth/verify/", UserVerifyView.as_view(), name="auth-login-verify"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="auth-token-verify"),
    path("", include([*router.urls, *chat_router.urls]))
]

websocket_patterns = [
    path("ws/chat/", consumers.MessageConsumer.as_asgi())
]
