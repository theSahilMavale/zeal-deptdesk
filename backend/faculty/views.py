from rest_framework import viewsets

from .models import Faculty
from .serializers import FacultySerializer


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.select_related("department").prefetch_related("subjects").all()
    serializer_class = FacultySerializer
    lookup_field = "id"
    lookup_value_regex = "[^/]+"

    filterset_fields = ["department", "designation"]
    search_fields = ["id", "name", "email"]
    ordering_fields = ["id", "name", "experience"]
    ordering = ["id"]
