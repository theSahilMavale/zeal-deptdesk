from rest_framework import viewsets

from .models import ClassSection
from .serializers import ClassSectionSerializer


class ClassSectionViewSet(viewsets.ModelViewSet):
    queryset = ClassSection.objects.select_related("department", "mentor").all()
    serializer_class = ClassSectionSerializer
    lookup_field = "id"
    lookup_value_regex = "[^/]+"

    filterset_fields = ["department", "year"]
    search_fields = ["id", "name", "department__code"]
    ordering_fields = ["id", "name", "year"]
    ordering = ["id"]
