"""Custom user model — role-aware. Roles are derived from the table, never
sent by the client during sign-in, to avoid privilege escalation."""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        FACULTY = "faculty", "Faculty"
        STUDENT = "student", "Student"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.STUDENT)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        ordering = ["username"]

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
