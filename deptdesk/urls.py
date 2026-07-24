"""Compatibility URL module for repository-root Django execution."""
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.deptdesk.urls import urlpatterns  # noqa: E402,F401