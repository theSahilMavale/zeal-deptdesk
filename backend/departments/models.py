from django.db import models


class Department(models.Model):
    code = models.CharField(max_length=16, unique=True, help_text="e.g. CO, ME, EE")
    name = models.CharField(max_length=120)
    hod = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="heading_departments",
    )
    established = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:
        return f"{self.code} — {self.name}"

    @property
    def faculty_count(self) -> int:
        return self.faculty_members.count()

    @property
    def student_count(self) -> int:
        # Students.dept stores a string code in this project; count by code.
        from students.models import Student
        return Student.objects.filter(dept=self.code).count()
