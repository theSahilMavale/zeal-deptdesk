from django.contrib import admin

from .models import AttendanceRecord


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "date", "status", "faculty")
    list_filter = ("status", "date", "subject")
    search_fields = ("student__id", "student__name", "subject__code")
    date_hierarchy = "date"
