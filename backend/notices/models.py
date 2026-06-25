from django.conf import settings
from django.db import models


class Notice(models.Model):
    class Category(models.TextChoices):
        GENERAL = "General", "General"
        EXAM = "Exam", "Exam"
        EVENT = "Event", "Event"
        HOLIDAY = "Holiday", "Holiday"
        ACADEMIC = "Academic", "Academic"
        URGENT = "Urgent", "Urgent"

    class Audience(models.TextChoices):
        ALL = "all", "All"
        STUDENTS = "students", "Students"
        FACULTY = "faculty", "Faculty"
        DEPARTMENT = "department", "Department"

    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    category = models.CharField(
        max_length=16, choices=Category.choices, default=Category.GENERAL,
    )
    audience = models.CharField(
        max_length=16, choices=Audience.choices, default=Audience.ALL,
    )
    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="notices",
        to_field="code",
        db_column="department_code",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="notices",
    )
    pinned = models.BooleanField(default=False)
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-pinned", "-published_at"]
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["audience"]),
        ]

    def __str__(self) -> str:
        return self.title
