from rest_framework import serializers

from students.models import Student
from subjects.models import Subject
from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    student_name = serializers.CharField(source="student.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Result
        fields = ("id", "student", "student_name", "subject", "subject_name",
                  "semester", "internal", "external", "total", "grade",
                  "published", "created_at", "updated_at")
        read_only_fields = ("id", "total", "created_at", "updated_at")
