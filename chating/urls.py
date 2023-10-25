from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from chating.auth.login.views import UserAuthView, UserVerifyView
from chating.auth.register.views import RegisterViewSet
from chating.viewsets import ChatViewSet, MessageViewSet
from rest_framework.routers import SimpleRouter
from chating import consumers


router = SimpleRouter()
router.register("chat", ChatViewSet, basename="chat")
router.register("message", MessageViewSet, basename="message")
router.register("auth/register", RegisterViewSet, basename="auth-register")

urlpatterns = [
    path("auth/login/", UserAuthView.as_view(), name="auth-login"),
    path("auth/login/verify/", UserVerifyView.as_view(), name="auth-login-verify"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="auth-token-verify"),
    *router.urls
]

websocket_patterns = [
    path("msg/", consumers.MessageConsumer.as_asgi())
]
