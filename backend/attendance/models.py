from django.db import models


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = "Present", "Present"
        ABSENT = "Absent", "Absent"
        LATE = "Late", "Late"
        LEAVE = "Leave", "Leave"

    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    subject = models.ForeignKey(
        "subjects.Subject", on_delete=models.PROTECT,
        related_name="attendance_records",
    )
    faculty = models.ForeignKey(
        "faculty.Faculty", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="attendance_marked",
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)
    remarks = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "student_id"]
        unique_together = ("student", "subject", "date")
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["student", "subject"]),
        ]

    def __str__(self) -> str:
        return f"{self.student_id} {self.subject_id} {self.date} {self.status}"
