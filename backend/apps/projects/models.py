from django.db import models
from django.conf import settings
import uuid


PROJECT_STATUS_CHOICES = [
    ('ACTIVE', 'Active'),
    ('ON_HOLD', 'On Hold'),
    ('COMPLETED', 'Completed'),
    ('ARCHIVED', 'Archived'),
]


class Project(models.Model):
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  
    
    
    status = models.IntegerField(choices=[
        (0, 'Active'),
        (1, 'On Hold'),
        (2, 'Completed'),
        (3, 'Archived')
    ], default=0)
    
    
    created = models.DateTimeField(auto_now_add=True)  
    modified = models.DateTimeField(auto_now=True)     
    
    
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='projects',
        through='ProjectMember'
    )
    
    
    is_archived = models.BooleanField(default=False)  
    
    
    def get_task_count(self):
        return self.tasks.count()
    
    
    def archive(self):
        self.is_archived = True
        self.save()
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created']  



class ProjectMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    
    role = models.CharField(
        max_length=20,
        choices=[
            ('OWNER', 'Owner'),
            ('ADMIN', 'Admin'),
            ('MEMBER', 'Member'),
            ('VIEWER', 'Viewer'),
        ],
        default='MEMBER'
    )
    
    
    joined_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('project', 'user')
    
    def __str__(self):
        return f"{self.user.email} - {self.project.name} ({self.role})"



class Milestone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='milestones'
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    
    
    completed_flag = models.BooleanField(default=False)  
    
    
    date_created = models.DateTimeField(auto_now_add=True)  
    date_modified = models.DateTimeField(auto_now=True)    
    
    def __str__(self):
        return self.title
    
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.due_date and self.due_date < self.date_created:
            raise ValidationError("Due date cannot be in the past")



class ProjectActivity(models.Model):
    id = models.AutoField(primary_key=True)  
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='activities'
    )
    
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_activities'
    )
    
    description = models.TextField()
    
    activity_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Project activities'
    
    def __str__(self):
        return f"{self.project.name} - {self.description[:50]}"



def get_projects_by_status(status_code):
    return Project.objects.filter(status=status_code)

def get_user_projects(user_id):
    return Project.objects.filter(members__id=user_id)

def get_projects_with_overdue_tasks():
    from django.utils import timezone
    from apps.tasks.models import Task
    
    
    overdue_tasks = Task.objects.filter(
        due_date__lt=timezone.now(),
        status__in=['TODO', 'IN_PROGRESS']
    )
    
    project_ids = overdue_tasks.values_list('project_id', flat=True).distinct()
    return Project.objects.filter(id__in=project_ids)