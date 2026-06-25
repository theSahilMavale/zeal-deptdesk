from rest_framework import serializers

from departments.models import Department
from subjects.models import Subject
from .models import Faculty


class FacultySerializer(serializers.ModelSerializer):
    dept = serializers.SlugRelatedField(
        source="department", slug_field="code",
        queryset=Department.objects.all(),
    )
    subjects = serializers.SlugRelatedField(
        slug_field="code", many=True,
        queryset=Subject.objects.all(), required=False,
    )

    class Meta:
        model = Faculty
        fields = ("id", "name", "email", "phone", "dept", "designation",
                  "subjects", "experience", "user",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")
        extra_kwargs = {
            "user": {"required": False, "allow_null": True},
            "phone": {"required": False, "allow_blank": True},
        }
