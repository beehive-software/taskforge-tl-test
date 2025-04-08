from rest_framework import serializers
from django.utils import timezone
from .models import Task, Comment, TaskHistory, Attachment
from apps.projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()


class CommentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'author_email', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def validate_content(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Comment must be at least 2 characters long")
        return value


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'task', 'uploader', 'file', 'filename', 'created_at']
        read_only_fields = ['id', 'created_at']


class TaskHistorySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = TaskHistory
        fields = ['id', 'task', 'user', 'action', 'timestamp']
        read_only_fields = ['id', 'task', 'user', 'timestamp']


class TaskDetailSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    history = TaskHistorySerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'assignee', 'creator',
            'status', 'priority', 'created_at', 'updated_at', 'due_date',
            'completed', 'comments', 'history', 'attachments',
            'is_overdue', 'days_until_due'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']
    
    def get_is_overdue(self, obj):
        if obj.due_date and timezone.now() > obj.due_date and obj.status != 'DONE':
            return True
        return False
    
    def get_days_until_due(self, obj):
        if not obj.due_date:
            return None
        
        now = timezone.now()
        if now > obj.due_date:
            return -1 * (now.date() - obj.due_date.date()).days
        
        return (obj.due_date.date() - now.date()).days


class TaskSerializer(serializers.ModelSerializer):
    creator_email = serializers.EmailField(source='creator.email', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    assignee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_name',
            'assignee', 'assignee_name', 'creator', 'creator_email',
            'status', 'priority', 'created_at', 'updated_at', 'due_date',
            'completed'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']
    
    def get_assignee_name(self, obj):
        if obj.assignee:
            return f"{obj.assignee.first_name} {obj.assignee.last_name}".strip() or obj.assignee.email
        return None
    
    def validate(self, data):
        if 'project' in data:
            try:
                project = Project.objects.get(id=data['project'].id)
            except Project.DoesNotExist:
                raise serializers.ValidationError({"project": "Project does not exist"})
        
        if 'assignee' in data and data['assignee']:
            try:
                user = User.objects.get(id=data['assignee'].id)
            except User.DoesNotExist:
                raise serializers.ValidationError({"assignee": "User does not exist"})
        
        if 'status' in data:
            valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]
            if data['status'] not in valid_statuses:
                raise serializers.ValidationError({"status": f"Status must be one of: {', '.join(valid_statuses)}"})
        
        if 'priority' in data:
            if not (1 <= data['priority'] <= 4):
                raise serializers.ValidationError({"priority": "Priority must be between 1 and 4"})
        
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        task = Task.objects.create(creator=user, **validated_data)

        TaskHistory.objects.create(
            task=task,
            user=user,
            action=f"Created task: {task.title}"
        )
        
        return task
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        changes = []
        for attr, value in validated_data.items():
            old_value = getattr(instance, attr)
            if old_value != value:
                changes.append(f"{attr}: {old_value} -> {value}")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if changes:
            TaskHistory.objects.create(
                task=instance,
                user=user,
                action=f"Updated task: {', '.join(changes)}"
            )
        
        return instance


class CreateCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']
    
    def create(self, validated_data):
        task_id = self.context['task_id']
        user = self.context['request'].user
        
        task = Task.objects.get(id=task_id)
        comment = Comment.objects.create(
            task=task,
            author=user,
            content=validated_data['content']
        )
        
        TaskHistory.objects.create(
            task=task,
            user=user,
            action=f"Added comment: {comment.content[:50]}..."
        )
        
        return comment