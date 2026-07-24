"""ASGI entrypoint that works when started from the repository root."""
from pathlib import Path
import os
import sys

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "deptdesk.settings")

from django.core.asgi import get_asgi_application  # noqa: E402

application = get_asgi_application()