from rest_framework import viewsets

from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related("department").all()
    serializer_class = SubjectSerializer
    lookup_field = "code"
    lookup_value_regex = "[^/]+"

    filterset_fields = ["department", "semester", "type"]
    search_fields = ["code", "name"]
    ordering_fields = ["code", "name", "semester", "credits"]
    ordering = ["semester", "code"]
