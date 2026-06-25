from rest_framework import serializers

from departments.models import Department
from subjects.models import Subject
from .models import PracticalManual


class PracticalManualSerializer(serializers.ModelSerializer):
    subject = serializers.SlugRelatedField(slug_field="code", queryset=Subject.objects.all())
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    dept = serializers.SlugRelatedField(
        source="department", slug_field="code",
        queryset=Department.objects.all(),
    )
    sem = serializers.IntegerField(source="semester", min_value=1, max_value=8)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = PracticalManual
        fields = ("id", "title", "subject", "subject_name", "dept", "sem",
                  "status", "file", "file_url", "description",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at", "file_url", "subject_name")
        extra_kwargs = {"file": {"required": False, "allow_null": True}}

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url
