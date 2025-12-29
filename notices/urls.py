from django.urls import path
from django.views.generic import RedirectView
from . import views

urlpatterns = [
    path('dashboard.html', RedirectView.as_view(url='/dashboard/', permanent=True)),
    path('display.html', RedirectView.as_view(url='/display/', permanent=True)),
    path('', views.login_view, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('display/', views.display_view, name='display'),
    path('logout/', views.logout_view, name='logout'),
    
    # API endpoints
    path('api/notices/', views.get_active_notices, name='api_notices'),
    path('api/upload/', views.upload_notice, name='api_upload'),
    path('api/moderate/<int:notice_id>/<str:action>/', views.moderate_notice, name='api_moderate'),
    path('api/create-club/', views.create_club, name='api_create_club'),
    path('api/delete-club/<int:club_id>/', views.delete_club, name='api_delete_club'),
    path('api/toggle-club-status/<int:club_id>/', views.toggle_club_status, name='api_toggle_club_status'),
    path('api/change-password/<int:club_id>/', views.change_password, name='api_change_password'),
]
