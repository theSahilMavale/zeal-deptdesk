"""DeptDesk URL configuration."""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT auth endpoints (consumed by src/lib/api/services/auth.ts)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # App routes
    path("api/", include("accounts.urls")),
    path("api/", include("departments.urls")),
    path("api/", include("subjects.urls")),
    path("api/", include("faculty.urls")),
    path("api/", include("students.urls")),
    path("api/", include("attendance.urls")),
    path("api/", include("results.urls")),
    path("api/", include("timetable.urls")),
    path("api/", include("notices.urls")),
]
