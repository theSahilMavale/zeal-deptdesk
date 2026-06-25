from rest_framework import serializers

from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    hod_name = serializers.CharField(source="hod.full_name", read_only=True)
    faculty = serializers.IntegerField(source="faculty_count", read_only=True)
    students = serializers.IntegerField(source="student_count", read_only=True)

    class Meta:
        model = Department
        fields = (
            "id", "code", "name", "hod", "hod_name",
            "established", "description", "faculty", "students",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
