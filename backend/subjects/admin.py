from django.contrib import admin

from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "department", "semester", "credits", "type")
    list_filter = ("department", "semester", "type")
    search_fields = ("code", "name")
