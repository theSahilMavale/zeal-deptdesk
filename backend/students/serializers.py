"""DRF serializers for the Students app.

The Python keyword ``class`` cannot be a Python attribute name, so the model
uses ``student_class`` and the serializer exposes it to the API as ``class``
via renaming in ``__init__``.

The serializer also owns the Student ↔ User relationship: creating a student
provisions a linked ``accounts.User`` account (role="student") so the person
can log in immediately from the same admin action.
"""
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Student

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    # Optional auth fields — allow admin to provision a login for the student
    # in the same request that creates the record. On update these are used
    # only to (re)set the password; username is fixed after creation.
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    has_login = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
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
            "username",
            "password",
            "has_login",
        ]
        extra_kwargs = {
            "phone": {"required": False, "allow_blank": True},
            "cgpa": {"required": False},
            "attendance": {"required": False},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "student_class" in self.fields:
            field = self.fields.pop("student_class")
            field.source = "student_class"
            self.fields["class"] = field

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        if "class" not in data and "student_class" in data:
            data["class"] = data.get("student_class")
        return super().to_internal_value(data)

    def get_has_login(self, obj) -> bool:
        return obj.user_id is not None

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

    def _split_name(self, full: str):
        parts = (full or "").strip().split(None, 1)
        return (parts[0] if parts else "", parts[1] if len(parts) > 1 else "")

    @transaction.atomic
    def create(self, validated_data):
        username = (validated_data.pop("username", "") or "").strip()
        password = validated_data.pop("password", "") or ""

        email = validated_data.get("email")
        roll = validated_data.get("id")
        name = validated_data.get("name", "")

        if not username:
            username = roll

        # Reuse an existing user with the same email/username when present —
        # prevents accidental duplicate accounts for the same person.
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.filter(username__iexact=username).first()

        if user is not None:
            other = Student.objects.filter(user=user).exclude(id=roll).first()
            if other:
                raise serializers.ValidationError({
                    "email": f"An account with this email is already linked to student {other.id}."
                })
            first, last = self._split_name(name)
            user.first_name = first
            user.last_name = last
            user.email = email
            user.role = "student"
            user.phone = validated_data.get("phone", "") or ""
            if password:
                user.set_password(password)
            user.save()
        else:
            if User.objects.filter(username__iexact=username).exists():
                raise serializers.ValidationError({
                    "username": "A user with this username already exists."
                })
            first, last = self._split_name(name)
            user = User(
                username=username,
                email=email,
                first_name=first,
                last_name=last,
                role="student",
                phone=validated_data.get("phone", "") or "",
            )
            if password:
                user.set_password(password)
            else:
                user.set_unusable_password()
            user.save()

        student = Student.objects.create(user=user, **validated_data)
        return student

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop("username", None)
        password = validated_data.pop("password", "") or ""

        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()

        user = instance.user
        if user is None:
            user = User.objects.filter(email__iexact=instance.email).first()
            if user is None:
                first, last = self._split_name(instance.name)
                user = User(
                    username=instance.id,
                    email=instance.email,
                    first_name=first,
                    last_name=last,
                    role="student",
                    phone=instance.phone or "",
                )
                user.set_unusable_password()
                user.save()
            instance.user = user
            instance.save(update_fields=["user"])

        first, last = self._split_name(instance.name)
        user.first_name = first
        user.last_name = last
        user.email = instance.email
        user.phone = instance.phone or ""
        user.role = "student"
        if password:
            user.set_password(password)
        user.save()

        return instance
