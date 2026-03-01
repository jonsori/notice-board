import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'noticeboard_cms.settings')
django.setup()

from django.contrib.auth.models import User
from notices.models import Club

def create_user_with_club(username, email, password, club_name, is_admin=False):
    if not User.objects.filter(username=username).exists():
        print(f"Creating {'superuser' if is_admin else 'user'} {username}...")
        if is_admin:
            user = User.objects.create_superuser(username, email, password)
        else:
            user = User.objects.create_user(username, email, password)
        
        Club.objects.get_or_create(user=user, name=club_name, is_admin=is_admin)
        print(f"{'Superuser' if is_admin else 'User'} {username} created successfully.")
    else:
        print(f"User {username} already exists. Updating password...")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        
        # Ensure club profile exists
        Club.objects.get_or_create(user=user, defaults={'name': club_name, 'is_admin': is_admin})
        print(f"Password and profile updated successfully for {username}.")

# Create Admin
create_user_with_club(
    username='admin',
    email='admin@example.com',
    password='adminpassword123',
    club_name='Central Admin',
    is_admin=True
)

# Create Normal User
create_user_with_club(
    username='user1',
    email='user1@example.com',
    password='userpassword123',
    club_name='Student Club',
    is_admin=False
)

