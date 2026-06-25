from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "student_class", "dept", "year", "cgpa", "attendance")
    list_filter = ("dept", "year", "student_class")
    search_fields = ("id", "name", "email")
    ordering = ("id",)
