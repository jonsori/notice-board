import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'noticeboard_cms.settings')
django.setup()

from django.contrib.auth.models import User
from notices.models import Club

username = 'admin'
email = 'admin@example.com'
password = 'adminpassword123'

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser {username}...")
    user = User.objects.create_superuser(username, email, password)
    Club.objects.get_or_create(user=user, name='Central Admin', is_admin=True)
    print("Superuser created successfully.")
else:
    print(f"Superuser {username} already exists. Updating password...")
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print("Password updated successfully.")
