from django.conf import settings
from django.db import models


class Faculty(models.Model):
    class Designation(models.TextChoices):
        PROFESSOR = "Professor", "Professor"
        ASSOCIATE = "Associate Professor", "Associate Professor"
        ASSISTANT = "Assistant Professor", "Assistant Professor"
        LECTURER = "Lecturer", "Lecturer"

    id = models.CharField(primary_key=True, max_length=32, help_text="Employee code")
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="faculty_profile",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="faculty_members",
        to_field="code",
        db_column="department_code",
    )
    designation = models.CharField(
        max_length=32, choices=Designation.choices, default=Designation.ASSISTANT
    )
    subjects = models.ManyToManyField(
        "subjects.Subject", related_name="faculty", blank=True,
    )
    experience = models.PositiveSmallIntegerField(default=0, help_text="Years")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Faculty"

    def __str__(self) -> str:
        return f"{self.id} — {self.name}"

    @property
    def full_name(self) -> str:
        return self.name
