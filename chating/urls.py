from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from chating.auth.views import UserAuthView

urlpatterns = [
    path("token/", UserAuthView.as_view(), name="api-token")
]
