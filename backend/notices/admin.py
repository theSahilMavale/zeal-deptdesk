from django.contrib import admin

from .models import Notice


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "audience", "department",
                    "author", "pinned", "published_at")
    list_filter = ("category", "audience", "pinned", "department")
    search_fields = ("title", "body")
    date_hierarchy = "published_at"
