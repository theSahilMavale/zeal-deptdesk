import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Student",
            fields=[
                ("id", models.CharField(max_length=32, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("student_class", models.CharField(db_column="class", max_length=32)),
                ("dept", models.CharField(max_length=64)),
                (
                    "year",
                    models.CharField(
                        choices=[("FY", "First Year"), ("SY", "Second Year"), ("TY", "Third Year")],
                        max_length=4,
                    ),
                ),
                (
                    "cgpa",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=4,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(10),
                        ],
                    ),
                ),
                (
                    "attendance",
                    models.PositiveSmallIntegerField(
                        default=0,
                        validators=[django.core.validators.MaxValueValidator(100)],
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["id"],
                "indexes": [
                    models.Index(fields=["dept"], name="students_st_dept_idx"),
                    models.Index(fields=["student_class"], name="students_st_class_idx"),
                    models.Index(fields=["year"], name="students_st_year_idx"),
                ],
            },
        ),
    ]
