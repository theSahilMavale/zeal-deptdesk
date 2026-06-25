from django.contrib import admin

from .models import Faculty


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "department", "designation", "experience")
    list_filter = ("department", "designation")
    search_fields = ("id", "name", "email")
    filter_horizontal = ("subjects",)
