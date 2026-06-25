from rest_framework import viewsets

from .models import Result
from .serializers import ResultSerializer


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related("student", "subject").all()
    serializer_class = ResultSerializer

    filterset_fields = ["student", "subject", "semester", "grade", "published"]
    search_fields = ["student__id", "student__name", "subject__code", "subject__name"]
    ordering_fields = ["semester", "total", "grade"]
    ordering = ["-semester"]
