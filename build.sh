#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create admin user if it doesn't exist
python manage.py shell -c "from django.contrib.auth.models import User; from notices.models import Club; User.objects.filter(username='admin').exists() or (user := User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword123'), Club.objects.get_or_create(user=user, name='Central Admin', is_admin=True), print('Superuser created successfully'))"
