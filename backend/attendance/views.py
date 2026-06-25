from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.select_related("student", "subject", "faculty").all()
    serializer_class = AttendanceRecordSerializer

    filterset_fields = ["student", "subject", "faculty", "date", "status"]
    search_fields = ["student__id", "student__name", "subject__code"]
    ordering_fields = ["date", "status"]
    ordering = ["-date"]

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_create(self, request):
        records = request.data if isinstance(request.data, list) else request.data.get("records", [])
        serializer = self.get_serializer(data=records, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="recent")
    def recent(self, request):
        qs = self.filter_queryset(self.get_queryset())
        if d := request.query_params.get("date"):
            qs = qs.filter(date=d)
        if s := request.query_params.get("subject"):
            qs = qs.filter(subject_id=s)
        if c := request.query_params.get("class"):
            qs = qs.filter(student__student_class=c)
        return Response(self.get_serializer(qs[:100], many=True).data)

    @action(detail=False, methods=["get"], url_path="trend")
    def trend(self, request):
        weeks = int(request.query_params.get("weeks", 6))
        today = timezone.localdate()
        start = today - timedelta(weeks=weeks)
        qs = self.get_queryset().filter(date__gte=start)
        if dept := request.query_params.get("dept"):
            qs = qs.filter(student__dept=dept)

        buckets = []
        for w in range(weeks):
            week_start = start + timedelta(weeks=w)
            week_end = week_start + timedelta(days=7)
            present = qs.filter(date__gte=week_start, date__lt=week_end,
                                status="Present").count()
            buckets.append({"week": f"W{w + 1}", "present": present})
        return Response(buckets)
