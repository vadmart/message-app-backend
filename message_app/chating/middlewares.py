from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken, TokenError

User = get_user_model()


@database_sync_to_async
def get_user(public_id):
    try:
        return User.objects.get_object_by_public_id(public_id=public_id)
    except User.DoesNotExist:
        return AnonymousUser()


class WebsocketJWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_dict = parse_qs(scope["query_string"])
        token = query_dict[b"token"][0].decode("UTF-8")

        try:
            access_token = AccessToken(token)
            scope["user"] = await get_user(access_token["user_id"])
        except TokenError:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
