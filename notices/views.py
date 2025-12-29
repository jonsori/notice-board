from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Notice, Club
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

def login_view(request):
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except:
            # Fallback for standard form submission if needed, but we use JS fetch
            username = request.POST.get('username')
            password = request.POST.get('password')
            
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return JsonResponse({'status': 'success', 'redirect_url': '/dashboard/'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid username or password'}, status=401)
            
    return render(request, 'login.html')

def logout_view(request):
    auth_logout(request)
    return redirect('login')

@login_required
def dashboard(request):
    # Get the club profile for the logged in user
    try:
        club = request.user.club_profile
    except Club.DoesNotExist:
        # Fallback if user doesn't have a club profile
        return render(request, 'error.html', {'message': 'User has no club profile assigned.'})

    # If central admin, show all. If club, show only theirs.
    if club.is_admin:
        notices = Notice.objects.all().select_related('club')
    else:
        notices = Notice.objects.filter(club=club).select_related('club')
    
    pending_count = notices.filter(status='pending').count()
    approved_count = notices.filter(status='approved').count()
    scheduled_count = notices.filter(status='scheduled').count()
    
    all_clubs = None
    if club.is_admin:
        all_clubs = Club.objects.all().select_related('user').order_by('name')

    return render(request, 'dashboard.html', {
        'club': club,
        'notices': notices,
        'pending_count': pending_count,
        'approved_count': approved_count,
        'scheduled_count': scheduled_count,
        'is_admin': club.is_admin,
        'all_clubs': all_clubs,
    })

def display_view(request):
    return render(request, 'display.html')

def get_active_notices(request):
    today = timezone.now().date()
    notices = Notice.objects.filter(
        status__in=['approved', 'scheduled'],
        start_date__lte=today
    ).filter(
        Q(end_date__gte=today) | Q(end_date__isnull=True)
    ).select_related('club').distinct()
    
    data = []
    for notice in notices:
        item = {
            'id': notice.id,
            'title': notice.title,
            'type': notice.type,
            'author': notice.club.name if notice.club else notice.author_name,
            'duration': notice.duration,
            'urgent': notice.is_urgent,
        }
        if notice.club and notice.club.logo:
            item['clubLogo'] = notice.club.logo.url
            
        if notice.type == 'text':
            item['textContent'] = notice.text_content
        elif notice.file:
            item['fileData'] = notice.file.url
            
        data.append(item)
        
    return JsonResponse(data, safe=False)

@login_required
def upload_notice(request):
    if request.method == 'POST':
        club = request.user.club_profile
        
        # Enforce club name for non-admins
        author_name = request.POST.get('author') or club.name
        if not club.is_admin:
            author_name = club.name
            
        try:
            duration = int(request.POST.get('duration', 10))
        except (ValueError, TypeError):
            duration = 10

        notice = Notice(
            title=request.POST.get('title'),
            type=request.POST.get('type'),
            club=club,
            author_name=author_name,
            duration=duration,
            is_urgent=request.POST.get('urgent') == 'true',
            start_date=request.POST.get('startDate') or timezone.now().date(),
            end_date=request.POST.get('endDate') or None,
            status='pending'
        )
        
        if notice.type == 'text':
            notice.text_content = request.POST.get('textContent')
        else:
            notice.file = request.FILES.get('file')
            
        notice.save()
        return JsonResponse({'status': 'success', 'id': notice.id})
    return JsonResponse({'status': 'error'}, status=400)

from django.contrib.auth.models import User

@login_required
def moderate_notice(request, notice_id, action):
    # Only central admin can moderate
    club = request.user.club_profile
    if not club.is_admin:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
        
    notice = get_object_or_404(Notice, id=notice_id)
    if action == 'approve':
        today = timezone.now().date()
        notice.status = 'scheduled' if notice.start_date > today else 'approved'
    elif action == 'reject' or action == 'pause':
        notice.status = 'rejected' if action == 'reject' else 'pending'
    elif action == 'delete':
        notice.delete()
        return JsonResponse({'status': 'success', 'message': 'Notice deleted'})
    
    notice.save()
    return JsonResponse({'status': 'success'})

@login_required
def create_club(request):
    # Only central admin can create new clubs/users
    club = request.user.club_profile
    if not club.is_admin:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
        
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            club_name = data.get('name')
            department = data.get('department', '')
            
            if not all([username, password, club_name]):
                return JsonResponse({'status': 'error', 'message': 'All fields are required'}, status=400)
                
            if User.objects.filter(username=username).exists():
                return JsonResponse({'status': 'error', 'message': 'Username already exists'}, status=400)
                
            user = User.objects.create_user(username=username, password=password)
            new_club = Club.objects.create(user=user, name=club_name, department=department, is_admin=False)
            
            return JsonResponse({'status': 'success', 'message': f'Club "{club_name}" created successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@login_required
def delete_club(request, club_id):
    # Only central admin can delete clubs
    club = request.user.club_profile
    if not club.is_admin:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
        
    target_club = get_object_or_404(Club, id=club_id)
    
    # Don't allow deleting the admin themselves
    if target_club.is_admin:
         return JsonResponse({'status': 'error', 'message': 'Cannot delete admin account'}, status=400)
         
    # Deleting the user will delete the club profile due to CASCADE
    target_user = target_club.user
    target_user.delete()
    
    return JsonResponse({'status': 'success', 'message': 'Account deleted successfully'})

@login_required
def toggle_club_status(request, club_id):
    # Only central admin can toggle status
    club = request.user.club_profile
    if not club.is_admin:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
        
    target_club = get_object_or_404(Club, id=club_id)
    
    if target_club.is_admin:
         return JsonResponse({'status': 'error', 'message': 'Cannot deactivate admin account'}, status=400)
         
    target_user = target_club.user
    target_user.is_active = not target_user.is_active
    target_user.save()
    
    status_text = "activated" if target_user.is_active else "deactivated"
    return JsonResponse({'status': 'success', 'message': f'Account {status_text} successfully'})
