#!/usr/bin/env bash
# Render build script when the service root is the repository root.
set -o errexit

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

python backend/manage.py collectstatic --no-input
python backend/manage.py migrate --no-input