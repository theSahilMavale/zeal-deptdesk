"""DRF serializer for Faculty.

Mirrors the Students app: the serializer owns the Faculty ↔ User
relationship so that creating a faculty record provisions a linked
``accounts.User`` account (role="faculty") in the same admin action.
"""
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from departments.models import Department
from subjects.models import Subject
from .models import Faculty

User = get_user_model()


class FacultySerializer(serializers.ModelSerializer):
    dept = serializers.SlugRelatedField(
        source="department", slug_field="code",
        queryset=Department.objects.all(),
    )
    subjects = serializers.SlugRelatedField(
        slug_field="code", many=True,
        queryset=Subject.objects.all(), required=False,
    )

    # Optional auth fields — provision login in the same request.
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    has_login = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Faculty
        fields = ("id", "name", "email", "phone", "dept", "designation",
                  "subjects", "experience", "user",
                  "username", "password", "has_login",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at", "user")
        extra_kwargs = {
            "phone": {"required": False, "allow_blank": True},
        }

    def get_has_login(self, obj) -> bool:
        return obj.user_id is not None

    def _split_name(self, full: str):
        parts = (full or "").strip().split(None, 1)
        return (parts[0] if parts else "", parts[1] if len(parts) > 1 else "")

    @transaction.atomic
    def create(self, validated_data):
        username = (validated_data.pop("username", "") or "").strip()
        password = validated_data.pop("password", "") or ""
        subjects = validated_data.pop("subjects", [])

        email = validated_data.get("email")
        emp_id = validated_data.get("id")
        name = validated_data.get("name", "")

        if not username:
            username = emp_id

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.filter(username__iexact=username).first()

        if user is not None:
            other = Faculty.objects.filter(user=user).exclude(id=emp_id).first()
            if other:
                raise serializers.ValidationError({
                    "email": f"An account with this email is already linked to faculty {other.id}."
                })
            first, last = self._split_name(name)
            user.first_name = first
            user.last_name = last
            user.email = email
            user.role = "faculty"
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
                role="faculty",
                phone=validated_data.get("phone", "") or "",
            )
            if password:
                user.set_password(password)
            else:
                user.set_unusable_password()
            user.save()

        faculty = Faculty.objects.create(user=user, **validated_data)
        if subjects:
            faculty.subjects.set(subjects)
        return faculty

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop("username", None)
        password = validated_data.pop("password", "") or ""
        subjects = validated_data.pop("subjects", None)

        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if subjects is not None:
            instance.subjects.set(subjects)

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
                    role="faculty",
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
        user.role = "faculty"
        if password:
            user.set_password(password)
        user.save()

        return instance
