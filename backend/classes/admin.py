from django.contrib import admin

from .models import ClassSection


@admin.register(ClassSection)
class ClassSectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "department", "year", "students", "mentor")
    list_filter = ("department", "year")
    search_fields = ("id", "name")
