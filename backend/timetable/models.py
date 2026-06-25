from django.db import models


class TimetableEntry(models.Model):
    class Day(models.IntegerChoices):
        MON = 1, "Monday"
        TUE = 2, "Tuesday"
        WED = 3, "Wednesday"
        THU = 4, "Thursday"
        FRI = 5, "Friday"
        SAT = 6, "Saturday"

    class_code = models.CharField(
        max_length=32, db_column="class",
        help_text="Class / section, e.g. 'CO5I'",
    )
    day = models.PositiveSmallIntegerField(choices=Day.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    subject = models.ForeignKey(
        "subjects.Subject", on_delete=models.PROTECT, related_name="timetable_entries",
        null=True, blank=True,
    )
    faculty = models.ForeignKey(
        "faculty.Faculty", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="timetable_entries",
    )
    room = models.CharField(max_length=32, blank=True)
    label = models.CharField(
        max_length=64, blank=True,
        help_text="Override label for breaks / labs, e.g. 'Recess'",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["class_code", "day", "start_time"]
        unique_together = ("class_code", "day", "start_time")
        indexes = [
            models.Index(fields=["class_code", "day"]),
        ]

    def __str__(self) -> str:
        return f"{self.class_code} {self.get_day_display()} {self.start_time}"
