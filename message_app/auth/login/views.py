from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from ..verify import otp


class UserAuthView(APIView):
    def post(self, request) -> Response:
        user = authenticate(**request.data)
        if user is None:
            raise AuthenticationFailed
        print(otp.now())
        return Response(data={"status": "pending"}, status=status.HTTP_200_OK)
