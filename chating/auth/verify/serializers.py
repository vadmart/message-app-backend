from typing import Dict, Any

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import UntypedToken
from chating.auth.user.models import User

from rest_framework_simplejwt.serializers import TokenVerifySerializer
from django.conf import settings


class UserTokenVerifySerializer(TokenVerifySerializer):

    def validate(self, attrs: Dict[str, None]) -> Dict[Any, Any]:
        token = UntypedToken(attrs["token"])
        if (
            api_settings.BLACKLIST_AFTER_ROTATION
            and "rest_framework_simplejwt.token_blacklist" in settings.INSTALLED_APPS
        ):
            jti = token.get(api_settings.JTI_CLAIM)
            if BlacklistedToken.objects.filter(token__jti=jti).exists():
                raise ValidationError("Token is blacklisted")
        get_object_or_404(User, public_id=token["user_id"])
        return {}
