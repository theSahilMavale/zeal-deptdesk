from rest_framework import serializers

from subjects.models import Subject
from faculty.models import Faculty
from .models import TimetableEntry


class TimetableEntrySerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False, allow_null=True,
    )
    faculty = serializers.PrimaryKeyRelatedField(
        queryset=Faculty.objects.all(), required=False, allow_null=True,
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    faculty_name = serializers.CharField(source="faculty.name", read_only=True)
    day_name = serializers.CharField(source="get_day_display", read_only=True)
    class_code = serializers.CharField(max_length=32)

    class Meta:
        model = TimetableEntry
        fields = ("id", "class_code", "day", "day_name",
                  "start_time", "end_time", "subject", "subject_name",
                  "faculty", "faculty_name", "room", "label",
                  "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
