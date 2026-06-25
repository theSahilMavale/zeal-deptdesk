from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Subject(models.Model):
    class Kind(models.TextChoices):
        THEORY = "Theory", "Theory"
        PRACTICAL = "Practical", "Practical"
        PROJECT = "Project", "Project"
        ELECTIVE = "Elective", "Elective"

    code = models.CharField(max_length=16, primary_key=True, help_text="e.g. 22516")
    name = models.CharField(max_length=160)
    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="subjects",
        to_field="code",
        db_column="department_code",
    )
    semester = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)]
    )
    credits = models.PositiveSmallIntegerField(default=3)
    type = models.CharField(max_length=16, choices=Kind.choices, default=Kind.THEORY)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["semester", "code"]
        indexes = [
            models.Index(fields=["department"]),
            models.Index(fields=["semester"]),
        ]

    def __str__(self) -> str:
        return f"{self.code} — {self.name}"
