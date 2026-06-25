from rest_framework.routers import DefaultRouter

from .views import PracticalManualViewSet

router = DefaultRouter()
router.register(r"practical-manuals", PracticalManualViewSet, basename="practical-manual")

urlpatterns = router.urls
