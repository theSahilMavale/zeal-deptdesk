from django.contrib import admin

from .models import TimetableEntry


@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    list_display = ("class_code", "day", "start_time", "end_time",
                    "subject", "faculty", "room")
    list_filter = ("class_code", "day", "subject")
    search_fields = ("class_code", "subject__code", "faculty__name", "room")
