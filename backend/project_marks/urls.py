from rest_framework.routers import DefaultRouter

from .views import ProjectMarkViewSet

router = DefaultRouter()
router.register(r"project-marks", ProjectMarkViewSet, basename="project-mark")

urlpatterns = router.urls
