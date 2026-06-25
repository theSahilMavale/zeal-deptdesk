from django.db import models


class ClassSection(models.Model):
    YEAR_CHOICES = [
        ("FY", "First Year"),
        ("SY", "Second Year"),
        ("TY", "Third Year"),
    ]

    id = models.CharField(primary_key=True, max_length=32, help_text="e.g. CO5I")
    name = models.CharField(max_length=64)
    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        to_field="code",
        db_column="department_code",
        related_name="classes",
    )
    year = models.CharField(max_length=4, choices=YEAR_CHOICES)
    students = models.PositiveIntegerField(default=0)
    mentor = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="mentored_classes",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]
        verbose_name = "Class"
        verbose_name_plural = "Classes"

    def __str__(self) -> str:
        return f"{self.id} — {self.name}"
