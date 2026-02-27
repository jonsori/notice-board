#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Ensure media directory exists on persistent disk
if [ -d "/data" ]; then
    mkdir -p /data/media/clubs/logos
    mkdir -p /data/media/notices
fi
