from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, LoginView, LogoutView, MeView, ChangePasswordView

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth_login"),
    path("auth/logout/", LogoutView.as_view(), name="auth_logout"),
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="auth_change_password"),
    path("auth/password/change/", ChangePasswordView.as_view()),  # alias used by frontend
    path("", include(router.urls)),
]
