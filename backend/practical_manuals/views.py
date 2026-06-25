from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import PracticalManual
from .serializers import PracticalManualSerializer


class PracticalManualViewSet(viewsets.ModelViewSet):
    queryset = PracticalManual.objects.select_related("subject", "department").all()
    serializer_class = PracticalManualSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = "id"
    lookup_value_regex = "[^/]+"

    filterset_fields = ["department", "subject", "semester", "status"]
    search_fields = ["id", "title", "subject__code", "subject__name"]
    ordering_fields = ["id", "title", "semester", "status"]
    ordering = ["id"]
