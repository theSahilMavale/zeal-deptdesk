from django.contrib.auth import get_user_model
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    UserSerializer,
    MeSerializer,
    DeptDeskTokenObtainPairSerializer,
)

User = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_superuser or getattr(request.user, "role", "") == "admin")
        )


class UserViewSet(viewsets.ModelViewSet):
    """Admin-only user management."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["role", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["username", "email", "role"]


class LoginView(TokenObtainPairView):
    serializer_class = DeptDeskTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)

    def patch(self, request):
        s = MeSerializer(request.user, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old = request.data.get("old_password")
        new = request.data.get("new_password")
        if not old or not new:
            return Response({"detail": "old_password and new_password required."},
                            status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(old):
            return Response({"detail": "Current password is incorrect."},
                            status=status.HTTP_400_BAD_REQUEST)
        if len(new) < 8:
            return Response({"detail": "Password must be at least 8 characters."},
                            status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new)
        request.user.save()
        return Response({"detail": "Password updated."})
