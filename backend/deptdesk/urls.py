"""DeptDesk URL configuration."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from accounts.views import analytics_overview

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT auth endpoints
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Aggregate analytics for the dashboard
    path("api/analytics/overview/", analytics_overview, name="analytics_overview"),
    # App routes
    path("api/", include("accounts.urls")),
    path("api/", include("departments.urls")),
    path("api/", include("subjects.urls")),
    path("api/", include("faculty.urls")),
    path("api/", include("students.urls")),
    path("api/", include("classes.urls")),
    path("api/", include("attendance.urls")),
    path("api/", include("results.urls")),
    path("api/", include("timetable.urls")),
    path("api/", include("notices.urls")),
    path("api/", include("practical_manuals.urls")),
    path("api/", include("project_marks.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
