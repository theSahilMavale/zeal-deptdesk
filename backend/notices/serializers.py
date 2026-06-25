from rest_framework import serializers

from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    date = serializers.DateTimeField(source="published_at", read_only=True)

    class Meta:
        model = Notice
        fields = ("id", "title", "body", "category", "audience",
                  "department", "author", "author_name", "author_username",
                  "pinned", "date", "published_at", "updated_at")
        read_only_fields = ("id", "author", "date", "published_at", "updated_at",
                            "author_name", "author_username")

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["author"] = request.user
        return super().create(validated_data)
