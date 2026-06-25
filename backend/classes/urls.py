from rest_framework.routers import DefaultRouter

from .views import ClassSectionViewSet

router = DefaultRouter()
router.register(r"classes", ClassSectionViewSet, basename="class")

urlpatterns = router.urls
