from rest_framework import serializers

from faculty.models import Faculty
from .models import ProjectMark


class ProjectMarkSerializer(serializers.ModelSerializer):
    guide = serializers.PrimaryKeyRelatedField(
        queryset=Faculty.objects.all(), required=False, allow_null=True,
    )
    guide_name = serializers.CharField(source="guide.name", read_only=True)
    total = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProjectMark
        fields = ("id", "title", "team", "guide", "guide_name",
                  "internal", "external", "total", "status",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at", "total", "guide_name")
