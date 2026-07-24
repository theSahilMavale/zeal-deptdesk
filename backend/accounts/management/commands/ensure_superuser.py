"""Create or update a Django superuser from environment variables.

Reads:
  DJANGO_SUPERUSER_USERNAME (default: admin)
  DJANGO_SUPERUSER_EMAIL    (default: admin@deptdesk.local)
  DJANGO_SUPERUSER_PASSWORD (required; command is a no-op if unset)

Safe to run on every deploy. Idempotent: if the user exists, it is promoted
to superuser/admin role and the password is refreshed.
"""
import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Ensure a superuser exists (idempotent). Configured via DJANGO_SUPERUSER_* env vars."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@deptdesk.local")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not password:
            self.stdout.write(self.style.WARNING(
                "DJANGO_SUPERUSER_PASSWORD not set; skipping superuser creation."
            ))
            return

        defaults = {
            "email": email,
            "is_staff": True,
            "is_superuser": True,
        }
        if hasattr(User, "role"):
            defaults["role"] = "admin"

        user, created = User.objects.get_or_create(username=username, defaults=defaults)

        # Always ensure elevated flags + fresh password on every deploy.
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        if hasattr(user, "role"):
            user.role = "admin"
        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} superuser '{username}'."))
