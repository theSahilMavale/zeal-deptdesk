from rest_framework import viewsets

from .models import ProjectMark
from .serializers import ProjectMarkSerializer


class ProjectMarkViewSet(viewsets.ModelViewSet):
    queryset = ProjectMark.objects.select_related("guide").all()
    serializer_class = ProjectMarkSerializer
    lookup_field = "id"
    lookup_value_regex = "[^/]+"

    filterset_fields = ["status", "guide"]
    search_fields = ["id", "title", "team"]
    ordering_fields = ["id", "title", "internal", "external", "status"]
    ordering = ["id"]
