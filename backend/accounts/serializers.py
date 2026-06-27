from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from departments.models import Department
from faculty.models import Faculty
from students.models import Student

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    name = serializers.SerializerMethodField()

    # Profile fields (write-only). Required only for faculty/student creation.
    profile_id = serializers.CharField(
        write_only=True, required=False, allow_blank=True,
        help_text="Employee code (faculty) or roll number (student).",
    )
    dept = serializers.CharField(write_only=True, required=False, allow_blank=True)
    designation = serializers.CharField(write_only=True, required=False, allow_blank=True)
    experience = serializers.IntegerField(write_only=True, required=False)
    student_class = serializers.CharField(write_only=True, required=False, allow_blank=True)
    year = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Read-only linked profile id surfaced for the UI.
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "name",
                  "role", "phone", "is_active", "password",
                  "profile_id", "dept", "designation", "experience",
                  "student_class", "year", "profile")
        read_only_fields = ("id", "name", "profile")

    def get_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return full or obj.username

    def get_profile(self, obj):
        if getattr(obj, "role", "") == "faculty":
            fac = Faculty.objects.filter(user=obj).first()
            if fac:
                return {"type": "faculty", "id": fac.id}
        elif getattr(obj, "role", "") == "student":
            stu = Student.objects.filter(user=obj).first()
            if stu:
                return {"type": "student", "id": stu.id}
        return None

    def _full_name(self, validated):
        return (f"{validated.get('first_name','')} {validated.get('last_name','')}"
                .strip() or validated.get("username", ""))

    def _pop_profile(self, validated_data):
        return {
            "profile_id": validated_data.pop("profile_id", "") or "",
            "dept": validated_data.pop("dept", "") or "",
            "designation": validated_data.pop("designation", "") or "",
            "experience": validated_data.pop("experience", 0) or 0,
            "student_class": validated_data.pop("student_class", "") or "",
            "year": validated_data.pop("year", "") or "",
        }

    def validate(self, attrs):
        # On create, enforce profile fields based on role.
        if self.instance is None:
            role = attrs.get("role")
            errors = {}
            if role == "faculty":
                if not (self.initial_data.get("profile_id") or "").strip():
                    errors["profile_id"] = "Employee code is required for faculty."
                if not (self.initial_data.get("dept") or "").strip():
                    errors["dept"] = "Department is required for faculty."
                if not (self.initial_data.get("designation") or "").strip():
                    errors["designation"] = "Designation is required for faculty."
            elif role == "student":
                if not (self.initial_data.get("profile_id") or "").strip():
                    errors["profile_id"] = "Roll number is required for student."
                if not (self.initial_data.get("dept") or "").strip():
                    errors["dept"] = "Department is required for student."
                if not (self.initial_data.get("student_class") or "").strip():
                    errors["student_class"] = "Class is required for student."
                if not (self.initial_data.get("year") or "").strip():
                    errors["year"] = "Year is required for student."
            if errors:
                raise serializers.ValidationError(errors)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        profile = self._pop_profile(validated_data)
        role = validated_data.get("role")
        email = validated_data.get("email")

        # Prevent duplicate faculty/student tied to same email.
        if role == "faculty" and Faculty.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "A faculty record with this email already exists."}
            )
        if role == "student" and Student.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "A student record with this email already exists."}
            )

        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        if role == "faculty":
            try:
                dept = Department.objects.get(code=profile["dept"])
            except Department.DoesNotExist:
                raise serializers.ValidationError(
                    {"dept": f"Department '{profile['dept']}' does not exist."}
                )
            if Faculty.objects.filter(id=profile["profile_id"]).exists():
                raise serializers.ValidationError(
                    {"profile_id": "A faculty member with this employee code already exists."}
                )
            Faculty.objects.create(
                id=profile["profile_id"],
                user=user,
                name=self._full_name(validated_data),
                email=email,
                phone=validated_data.get("phone", ""),
                department=dept,
                designation=profile["designation"] or Faculty.Designation.ASSISTANT,
                experience=int(profile["experience"] or 0),
            )
        elif role == "student":
            if Student.objects.filter(id=profile["profile_id"]).exists():
                raise serializers.ValidationError(
                    {"profile_id": "A student with this roll number already exists."}
                )
            Student.objects.create(
                id=profile["profile_id"],
                user=user,
                name=self._full_name(validated_data),
                email=email,
                phone=validated_data.get("phone", ""),
                student_class=profile["student_class"],
                dept=profile["dept"],
                year=profile["year"],
            )
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        # Ignore profile_* fields on update — handled via dedicated modules.
        self._pop_profile(validated_data)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()

        # Keep linked profile name/email/phone in sync.
        name = self._full_name({
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "username": instance.username,
        })
        if instance.role == "faculty":
            Faculty.objects.filter(user=instance).update(
                name=name, email=instance.email, phone=instance.phone or "",
            )
        elif instance.role == "student":
            Student.objects.filter(user=instance).update(
                name=name, email=instance.email, phone=instance.phone or "",
            )
        return instance


class MeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name",
                  "name", "role", "phone")
        read_only_fields = fields

    def get_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return full or obj.username


class DeptDeskTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT serializer that accepts either `username` or `email` for sign-in
    and embeds the resolved user record in the response.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        email = self.initial_data.get("email") if hasattr(self, "initial_data") else None
        username = attrs.get(self.username_field)
        if (not username) and email:
            try:
                user = User.objects.get(email__iexact=email)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        elif username and "@" in username:
            try:
                user = User.objects.get(email__iexact=username)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        data["user"] = MeSerializer(self.user).data
        return data
