from rest_framework import viewsets

from .models import Notice
from .serializers import NoticeSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.select_related("author", "department").all()
    serializer_class = NoticeSerializer

    filterset_fields = ["category", "audience", "department", "pinned"]
    search_fields = ["title", "body"]
    ordering_fields = ["published_at", "pinned", "title"]
    ordering = ["-pinned", "-published_at"]
