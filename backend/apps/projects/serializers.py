from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, ProjectActivity, Milestone
from apps.tasks.serializers import TaskSerializer

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'user_id', 'role', 'joined_date']
        read_only_fields = ['id', 'joined_date']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        project = validated_data.pop('project')
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"user_id": "User does not exist"})
        
        
        if ProjectMember.objects.filter(project=project, user=user).exists():
            raise serializers.ValidationError({"user_id": "User is already a member of this project"})
        
        
        return ProjectMember.objects.create(
            project=project,
            user=user,
            **validated_data
        )



class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id', 'title', 'description', 'due_date', 'completed_flag',
                 'date_created', 'date_modified']
        read_only_fields = ['id', 'date_created', 'date_modified']
    
    
    def validate_due_date(self, value):
        from django.utils import timezone
        if value and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value


class ProjectSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'created', 'modified',
                 'is_archived', 'member_count', 'task_count']
        read_only_fields = ['id', 'created', 'modified']
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def validate(self, data):
        if 'status' in data:
            status_value = data['status']
            if status_value not in [0, 1, 2, 3]:
                raise serializers.ValidationError({
                    "status": "Invalid status value. Must be 0 (Active), 1 (On Hold), 2 (Completed), or 3 (Archived)"
                })
        return data


class ProjectDetailSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    milestones = MilestoneSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'created', 'modified',
                 'is_archived', 'members', 'tasks', 'milestones']
        read_only_fields = ['id', 'created', 'modified']
    
    def get_members(self, obj):
        members = ProjectMember.objects.filter(project=obj)
        return ProjectMemberSerializer(members, many=True).data
    
    def get_tasks(self, obj):
        tasks = obj.tasks.all()
        return TaskSerializer(tasks, many=True).data


class ProjectActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='performed_by.email', read_only=True)
    
    class Meta:
        model = ProjectActivity
        fields = ['id', 'description', 'activity_date', 'user_email']
        read_only_fields = ['id', 'activity_date']


def get_project_with_stats(project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return None
    
    project_data = {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created": project.created,
        "is_archived": project.is_archived,
    }
    
    from apps.tasks.models import Task
    
    tasks = Task.objects.filter(project=project)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='DONE').count()
    
    project_data["task_stats"] = {
        "total": total_tasks,
        "completed": completed_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    }
    
    return project_data