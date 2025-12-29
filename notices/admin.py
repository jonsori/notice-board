from django.contrib import admin
from .models import Club, Notice

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_admin')
    search_fields = ('name', 'user__username')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'type', 'status', 'start_date', 'is_urgent')
    list_filter = ('type', 'status', 'club', 'is_urgent')
    search_fields = ('title', 'author_name', 'club__name')
    date_hierarchy = 'created_at'
    
    def content_type(self, obj):
        return obj.get_type_display()
    content_type.short_description = 'Type'
