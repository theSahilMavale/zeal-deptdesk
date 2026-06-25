"""ViewSets for the Students app."""
from django.db.models import Avg
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for students.

    Endpoints (mounted at /api/students/):
        GET    /api/students/                  list (paginated, filterable)
        POST   /api/students/                  create
        GET    /api/students/{id}/             retrieve
        PATCH  /api/students/{id}/             partial update
        PUT    /api/students/{id}/             full update
        DELETE /api/students/{id}/             destroy
        POST   /api/students/bulk/             bulk create
        GET    /api/students/stats/            aggregate stats
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    lookup_field = "id"
    lookup_value_regex = "[^/]+"

    # django-filter / search / ordering
    filterset_fields = ["dept", "year", "student_class"]
    search_fields = ["id", "name", "email", "student_class", "dept"]
    ordering_fields = ["id", "name", "cgpa", "attendance"]
    ordering = ["id"]

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_create(self, request):
        """Create many students in one request (used by the 'Import CSV' UI)."""
        records = request.data if isinstance(request.data, list) else request.data.get(
            "records", []
        )
        serializer = self.get_serializer(data=records, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """Summary stats consumed by dashboards."""
        qs = self.filter_queryset(self.get_queryset())
        aggregates = qs.aggregate(
            avg_cgpa=Avg("cgpa"), avg_attendance=Avg("attendance")
        )
        return Response(
            {
                "total": qs.count(),
                "avg_cgpa": float(aggregates["avg_cgpa"] or 0),
                "avg_attendance": float(aggregates["avg_attendance"] or 0),
                "by_dept": list(
                    qs.values("dept")
                    .order_by("dept")
                    .annotate(students=Avg("attendance"))
                ),
            }
        )
