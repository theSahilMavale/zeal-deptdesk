from rest_framework import serializers

from departments.models import Department
from faculty.models import Faculty
from .models import ClassSection


class ClassSectionSerializer(serializers.ModelSerializer):
    dept = serializers.SlugRelatedField(
        source="department", slug_field="code",
        queryset=Department.objects.all(),
    )
    mentor = serializers.PrimaryKeyRelatedField(
        queryset=Faculty.objects.all(), required=False, allow_null=True,
    )
    mentor_name = serializers.CharField(source="mentor.name", read_only=True)

    class Meta:
        model = ClassSection
        fields = ("id", "name", "dept", "year", "students",
                  "mentor", "mentor_name",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")
