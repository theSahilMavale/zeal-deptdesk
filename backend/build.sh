#!/usr/bin/env bash
# Render build script for the DeptDesk Django backend.
set -o errexit

cd "$(dirname "$0")"

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate --no-input
python manage.py ensure_superuser
