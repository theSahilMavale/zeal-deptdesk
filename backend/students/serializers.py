"""DRF serializers for the Students app.

Field names mirror the frontend `Student` TypeScript type. The Python
keyword `class` cannot be a model field name, so the model uses
`student_class` and the serializer exposes it as `class` via `source=`.
"""
from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    # Map the model's `student_class` to the API field `class`.
    # `class` is a reserved word, so we register it via `__init__`.
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

    def get_fields(self):
        # Manually declare the `class` field — ModelSerializer can't
        # auto-discover it from `fields` because the model attribute
        # is named `student_class`.
        fields = super().get_fields()
        fields["class"] = serializers.CharField(
            source="student_class", max_length=32
        )
        return fields

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
