from django.db import models


class PracticalManual(models.Model):
    class Status(models.TextChoices):
        DRAFT = "Draft", "Draft"
        REVIEW = "Review", "Review"
        PUBLISHED = "Published", "Published"

    id = models.CharField(primary_key=True, max_length=32)
    title = models.CharField(max_length=200)
    subject = models.ForeignKey(
        "subjects.Subject", on_delete=models.PROTECT,
        related_name="manuals",
    )
    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        to_field="code",
        db_column="department_code",
        related_name="manuals",
    )
    semester = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    file = models.FileField(upload_to="practical_manuals/", null=True, blank=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.id} — {self.title}"
