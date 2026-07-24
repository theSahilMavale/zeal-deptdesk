"""Compatibility settings module for Render root-level start commands.

The real Django project lives in backend/deptdesk. This wrapper lets commands
like `gunicorn deptdesk.wsgi:application` work from the repository root.
"""
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.deptdesk.settings import *  # noqa: F401,F403,E402