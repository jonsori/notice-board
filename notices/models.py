from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Club(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='club_profile')
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True, help_text="Specific department or faculty")
    logo = models.ImageField(upload_to='clubs/logos/', null=True, blank=True)
    description = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False, help_text="Designate if this is the central Student Union admin")

    def __str__(self):
        return self.name

class Notice(models.Model):
    CONTENT_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('text', 'Text Announcement'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved / Live'),
        ('scheduled', 'Scheduled'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='notices', null=True)
    author_name = models.CharField(max_length=100, help_text="Individual name or credit")
    duration = models.IntegerField(default=10, help_text="Duration in seconds")
    is_urgent = models.BooleanField(default=False)
    
    # Content data
    file = models.FileField(upload_to='notices/%Y/%m/%d/', null=True, blank=True)
    text_content = models.TextField(null=True, blank=True)
    
    # Scheduling
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    
    # Workflow
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.club.name if self.club else 'No Club'})"

    class Meta:
        ordering = ['-created_at']
