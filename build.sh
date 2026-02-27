#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Fix line endings and permissions for start.sh
sed -i 's/\r$//' start.sh
chmod +x start.sh

python manage.py collectstatic --no-input
