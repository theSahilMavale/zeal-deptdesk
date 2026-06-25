from django.contrib import admin

from .models import Result


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "semester", "internal", "external",
                    "total", "grade", "published")
    list_filter = ("semester", "grade", "published", "subject")
    search_fields = ("student__id", "student__name", "subject__code")
