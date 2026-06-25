from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import TimetableEntry
from .serializers import TimetableEntrySerializer


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.select_related("subject", "faculty").all()
    serializer_class = TimetableEntrySerializer

    filterset_fields = ["class_code", "day", "subject", "faculty"]
    search_fields = ["class_code", "subject__code", "faculty__name", "room"]
    ordering_fields = ["class_code", "day", "start_time"]
    ordering = ["class_code", "day", "start_time"]

    @action(detail=False, methods=["get"], url_path=r"by-class/(?P<class_code>[^/.]+)")
    def by_class(self, request, class_code=None):
        qs = self.get_queryset().filter(class_code=class_code)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["put"], url_path=r"by-class/(?P<class_code>[^/.]+)/replace")
    def replace_class(self, request, class_code=None):
        """Replace all entries for a class in one shot."""
        rows = request.data.get("rows", request.data)
        TimetableEntry.objects.filter(class_code=class_code).delete()
        for row in rows:
            row["class_code"] = class_code
        serializer = self.get_serializer(data=rows, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
