"""DRF serializers for the Students app.

The Python keyword ``class`` cannot be a Python attribute name, so the model
uses ``student_class`` and the serializer exposes it to the API as ``class``
via ``serializers.CharField(source="student_class")`` declared through
``extra_kwargs`` / ``__init__`` injection rather than as a class attribute
(which would be a ``SyntaxError``).
"""
from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        # Use the real model attribute name here so ModelSerializer can
        # validate ``fields`` against the model. We rename it to ``class``
        # on the wire in ``__init__``.
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "student_class",
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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Expose ``student_class`` as ``class`` in the serialized payload.
        if "student_class" in self.fields:
            field = self.fields.pop("student_class")
            # Ensure the field still writes back to the model attribute.
            field.source = "student_class"
            self.fields["class"] = field

    def to_internal_value(self, data):
        # Accept either ``class`` (frontend) or ``student_class`` (admin/tests).
        if hasattr(data, "copy"):
            data = data.copy()
        if "class" not in data and "student_class" in data:
            data["class"] = data.get("student_class")
        return super().to_internal_value(data)

    def validate_id(self, value: str) -> str:
        value = (value or "").strip()
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
