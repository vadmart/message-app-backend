from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import TokenSerializer
from rest_framework.permissions import AllowAny


class UserAuthView(TokenObtainPairView):
    serializer_class = TokenSerializer
    permission_classes = (AllowAny,)
