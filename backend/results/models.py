from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Result(models.Model):
    class Grade(models.TextChoices):
        O = "O", "Outstanding"
        A_PLUS = "A+", "A+"
        A = "A", "A"
        B_PLUS = "B+", "B+"
        B = "B", "B"
        C = "C", "C"
        D = "D", "D"
        F = "F", "Fail"

    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE, related_name="results",
    )
    subject = models.ForeignKey(
        "subjects.Subject", on_delete=models.PROTECT, related_name="results",
    )
    semester = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)]
    )
    internal = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    external = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    grade = models.CharField(max_length=4, choices=Grade.choices, blank=True)
    published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-semester", "student_id"]
        unique_together = ("student", "subject", "semester")
        indexes = [
            models.Index(fields=["semester"]),
            models.Index(fields=["student", "semester"]),
        ]

    def save(self, *args, **kwargs):
        self.total = (self.internal or 0) + (self.external or 0)
        if not self.grade:
            self.grade = self._derive_grade(float(self.total))
        super().save(*args, **kwargs)

    @staticmethod
    def _derive_grade(total: float) -> str:
        for cutoff, g in [(90, "O"), (80, "A+"), (70, "A"),
                          (60, "B+"), (50, "B"), (45, "C"), (40, "D")]:
            if total >= cutoff:
                return g
        return "F"

    def __str__(self) -> str:
        return f"{self.student_id} {self.subject_id} S{self.semester} {self.grade}"
