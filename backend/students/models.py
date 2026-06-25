"""
Student domain model.

Mirrors the `Student` TypeScript interface in `src/lib/api/types.ts`:
    id, name, email, phone, class, dept, year, cgpa, attendance
"""
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Student(models.Model):
    YEAR_CHOICES = [
        ("FY", "First Year"),
        ("SY", "Second Year"),
        ("TY", "Third Year"),
    ]

    # `id` is the roll number (e.g. "ZP-CO-001") — used as the primary key
    # so the frontend can keep using the human-readable identifier.
    id = models.CharField(primary_key=True, max_length=32)
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)

    student_class = models.CharField(
        max_length=32,
        help_text="Class / section code, e.g. 'CO5I'",
        db_column="class",
    )
    dept = models.CharField(max_length=64)
    year = models.CharField(max_length=4, choices=YEAR_CHOICES)

    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        default=0,
    )
    attendance = models.PositiveSmallIntegerField(
        default=0,
        validators=[MaxValueValidator(100)],
        help_text="Overall attendance percentage (0-100).",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]
        indexes = [
            models.Index(fields=["dept"]),
            models.Index(fields=["student_class"]),
            models.Index(fields=["year"]),
        ]

    def __str__(self) -> str:
        return f"{self.id} — {self.name}"
