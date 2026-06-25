from django.contrib import admin

from .models import PracticalManual


@admin.register(PracticalManual)
class PracticalManualAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "subject", "department", "semester", "status")
    list_filter = ("status", "department", "semester")
    search_fields = ("id", "title")
