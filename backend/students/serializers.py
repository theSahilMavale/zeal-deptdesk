"""DRF serializers for the Students app.

Field names are aligned with the frontend Student type. The model field
`student_class` is exposed as `class` because `class` is a Python keyword.
"""
from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    # Frontend uses `class` — map it to the model's `student_class` field.
    **{"class": serializers.CharField(source="student_class", max_length=32)} \
        if False else None  # noqa: placeholder to keep linters quiet

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "class",
            "dept",
            "year",
            "cgpa",
            "attendance",
        ]
        extra_kwargs = {
            "phone": {"required": False, "allow_blank": True},
            "cgpa": {"required": False},
            "attendance": {"required": False},
        }

    # Declare the `class` alias explicitly (cleaner than the hack above).
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace any auto-generated `student_class` field, expose `class`.
        if "student_class" in self.fields:
            self.fields.pop("student_class")
        self.fields["class"] = serializers.CharField(
            source="student_class", max_length=32
        )

    def validate_id(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Roll number is required.")
        return value

    def validate_cgpa(self, value):
        if value is None:
            return value
        if value < 0 or value > 10:
            raise serializers.ValidationError("CGPA must be between 0 and 10.")
        return value

    def validate_attendance(self, value: int) -> int:
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Attendance must be between 0 and 100."
            )
        return value
