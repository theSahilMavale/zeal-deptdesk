from rest_framework import viewsets

from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    lookup_field = "code"
    lookup_value_regex = "[^/]+"

    filterset_fields = ["code"]
    search_fields = ["code", "name", "description"]
    ordering_fields = ["code", "name", "established"]
    ordering = ["code"]
