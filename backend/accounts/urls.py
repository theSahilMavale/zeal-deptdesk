from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, LoginView, MeView, ChangePasswordView

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth_login"),
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="auth_change_password"),
    path("", include(router.urls)),
]
