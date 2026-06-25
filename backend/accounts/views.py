from django.contrib.auth import get_user_model
from django.db.models import Avg
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from departments.models import Department
from faculty.models import Faculty
from students.models import Student
from subjects.models import Subject

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
    """
    Accepts either {username, password} or {email, password}.
    Returns access + refresh + user payload.
    """
    serializer_class = DeptDeskTokenObtainPairSerializer


class LogoutView(APIView):
    """Blacklist the supplied refresh token (best-effort)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def analytics_overview(request):
    """Aggregate counts shown on the dashboard."""
    students_qs = Student.objects.all()
    avg_att = students_qs.aggregate(v=Avg("attendance"))["v"] or 0
    return Response({
        "totals": {
            "students": students_qs.count(),
            "faculty": Faculty.objects.count(),
            "departments": Department.objects.count(),
            "subjects": Subject.objects.count(),
        },
        "attendance_today_pct": round(float(avg_att), 1),
    })
