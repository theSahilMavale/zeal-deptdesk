from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class ProjectMark(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "In Progress", "In Progress"
        SUBMITTED = "Submitted", "Submitted"
        EVALUATED = "Evaluated", "Evaluated"

    id = models.CharField(primary_key=True, max_length=32)
    title = models.CharField(max_length=200)
    team = models.CharField(max_length=200, help_text="Team members / lead name")
    guide = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="guided_projects",
    )
    internal = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    external = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.id} — {self.title}"

    @property
    def total(self) -> int:
        return int(self.internal or 0) + int(self.external or 0)
