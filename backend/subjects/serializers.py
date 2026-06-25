from rest_framework import serializers

from .models import Subject


class SubjectSerializer(serializers.ModelSerializer):
    # Frontend uses `dept` and `sem` keys.
    dept = serializers.SlugRelatedField(
        source="department", slug_field="code",
        queryset=__import__("departments").models.Department.objects.all(),
    )
    sem = serializers.IntegerField(source="semester", min_value=1, max_value=8)

    class Meta:
        model = Subject
        fields = ("code", "name", "dept", "sem", "credits", "type",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")
