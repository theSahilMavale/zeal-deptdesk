from rest_framework import serializers

from students.models import Student
from subjects.models import Subject
from faculty.models import Faculty
from .models import AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_id = serializers.PrimaryKeyRelatedField(
        source="student", queryset=Student.objects.all(),
    )
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    faculty = serializers.PrimaryKeyRelatedField(
        queryset=Faculty.objects.all(), required=False, allow_null=True,
    )
    name = serializers.CharField(source="student.name", read_only=True)
    student_class = serializers.CharField(source="student.student_class", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ("id", "student_id", "name", "student_class",
                  "subject", "faculty", "date", "status", "remarks",
                  "created_at")
        read_only_fields = ("id", "created_at")
