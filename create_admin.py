import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'noticeboard_cms.settings')
django.setup()

from django.contrib.auth.models import User
from notices.models import Club

def create_user_with_club(username, email, password, club_name, is_admin=False):
    print(f"Checking user: {username}")
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    
    if created:
        print(f"Created new {'superuser' if is_admin else 'user'}: {username}")
        user.set_password(password)
        if is_admin:
            user.is_superuser = True
            user.is_staff = True
    else:
        print(f"User {username} already exists. Updating password and permissions...")
        user.set_password(password)
        if is_admin:
            user.is_superuser = True
            user.is_staff = True
    
    user.email = email
    user.save()
    
    # Ensure club profile exists and is updated
    club, club_created = Club.objects.update_or_create(
        user=user,
        defaults={
            'name': club_name,
            'is_admin': is_admin
        }
    )
    
    print(f"Club profile for {username} {'created' if club_created else 'updated'}. (Name: {club_name}, IsAdmin: {is_admin})")
    print(f"Authentication verification: {username} is ready.")

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

