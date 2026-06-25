from django.contrib import admin

from .models import ProjectMark


@admin.register(ProjectMark)
class ProjectMarkAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "team", "guide", "internal", "external", "status")
    list_filter = ("status",)
    search_fields = ("id", "title", "team")
