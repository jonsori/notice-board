#!/usr/bin/env bash
# exit on error
set -o errexit

# Ensure media directory exists on persistent disk
mkdir -p /data/media/clubs/logos
mkdir -p /data/media/notices

# Run migrations at runtime to ensure they apply to the persistent disk
python manage.py migrate
python create_admin.py

# Start the application
gunicorn noticeboard_cms.wsgi:application
