from django.db import models
from django.conf import settings
from apps.projects.models import Project
import uuid

TASK_STATUS_CHOICES = [
    ('TODO', 'To Do'),
    ('IN_PROGRESS', 'In Progress'),
    ('REVIEW', 'In Review'),
    ('DONE', 'Done'),
]

PRIORITY_CHOICES = [
    (1, 'Low'),
    (2, 'Medium'),
    (3, 'High'),
    (4, 'Urgent'),
]


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='tasks'
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_tasks'
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES, default='TODO')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    
    def get_comments(self):
        return Comment.objects.filter(task=self).order_by('-created_at')
    
    def __str__(self):
        return self.title
    
    def mark_complete(self):
        self.status = 'DONE'
        self.completed = True
        self.save()
    
    def is_overdue(self):
        from django.utils import timezone
        if self.due_date and timezone.now() > self.due_date and self.status != 'DONE':
            return True
        return False
    
    @classmethod
    def get_tasks_by_status(cls, status):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM apps_tasks_task WHERE status = %s", [status])
            return cursor.fetchall()


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.task.title}"


class TaskNote(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Note on {self.task.title}"


class TaskHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Task histories'  


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    uploader = models.CharField(max_length=255)
    file = models.FileField(upload_to='attachments/')
    filename = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.filename


def calculate_task_metrics():
    """
    Calculate task completion metrics.
    This should be in a service or utils file.
    """
    total = Task.objects.count()
    completed = Task.objects.filter(status='DONE').count()
    return {
        'total': total,
        'completed': completed,
        'completion_rate': (completed / total * 100) if total > 0 else 0
    }