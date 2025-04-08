from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db import transaction
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from .models import Project, ProjectMember, ProjectActivity
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectMemberSerializer
from apps.tasks.models import Task



class ProjectViewSet(viewsets.ModelViewSet):
    """API endpoint for projects."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_queryset(self):
        """
        Restrict projects to those the user is a member of.
        """
        user = self.request.user
        
        return Project.objects.filter(members=user)
    
    def get_serializer_class(self):
        """
        Return different serializers based on action.
        """
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        """Create a new project and add current user as owner."""
        with transaction.atomic():
            
            project = serializer.save()
            
            
            ProjectMember.objects.create(
                project=project,
                user=self.request.user,
                role='OWNER'
            )
            
            
            ProjectActivity.objects.create(
                project=project,
                performed_by=self.request.user,
                description=f"Project created: {project.name}"
            )
    
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a project."""
        project = self.get_object()
        project.is_archived = True
        project.save()
        
        
        ProjectActivity.objects.create(
            project=project,
            performed_by=request.user,
            description="Project archived"
        )
        
        return Response({"status": "Project archived"})



@api_view(['GET'])
def project_stats(request, project_id):
    """Get project statistics."""
    project = get_object_or_404(Project, id=project_id)
    
    
    if not project.members.filter(id=request.user.id).exists():
        return Response({"error": "You don't have permission to view this project"},
                       status=status.HTTP_403_FORBIDDEN)
    
    
    tasks = Task.objects.filter(project=project)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='DONE').count()
    
    
    status_counts = {}
    for task in tasks:
        if task.status in status_counts:
            status_counts[task.status] += 1
        else:
            status_counts[task.status] = 1
    
    
    user_task_counts = {}
    for task in tasks:
        if task.assignee:
            assignee_name = f"{task.assignee.first_name} {task.assignee.last_name}".strip() or task.assignee.email
            if assignee_name in user_task_counts:
                user_task_counts[assignee_name] += 1
            else:
                user_task_counts[assignee_name] = 1
    
    return Response({
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "status_distribution": status_counts,
        "user_task_counts": user_task_counts
    })



class ProjectMemberAPIView(APIView):
    """API for managing project members."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, project_id):
        """Get all members of a project."""
        project = get_object_or_404(Project, id=project_id)
        
        
        if not project.members.filter(id=request.user.id).exists():
            raise PermissionDenied("You don't have permission to view this project")
        
        
        members = ProjectMember.objects.filter(project=project)
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    def post(self, request, project_id):
        """Add a member to a project."""
        project = get_object_or_404(Project, id=project_id)
        
        
        user_membership = ProjectMember.objects.filter(
            project=project, 
            user=request.user
        ).first()
        
        if not user_membership or user_membership.role not in ['OWNER', 'ADMIN']:
            raise PermissionDenied("You don't have permission to add members to this project")
        
        serializer = ProjectMemberSerializer(data=request.data)
        if serializer.is_valid():
            
            try:
                member = serializer.save(project=project)
                
                
                ProjectActivity.objects.create(
                    project=project,
                    performed_by=request.user,
                    description=f"Added {member.user.email} as {member.role}"
                )
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def project_activities(request, project_id):
    """Get project activity feed."""
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    if not ProjectMember.objects.filter(project=project, user=request.user).exists():
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    
    
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT pa.id, pa.description, pa.activity_date, auth_user.email
            FROM apps_projects_projectactivity pa
            JOIN auth_user ON pa.performed_by_id = auth_user.id
            WHERE pa.project_id = %s
            ORDER BY pa.activity_date DESC
            LIMIT 20
        """, [project_id])
        
        activities = []
        for row in cursor.fetchall():
            activities.append({
                "id": row[0],
                "description": row[1],
                "date": row[2],
                "user": row[3]
            })
    
    return JsonResponse({"activities": activities})



@api_view(['POST'])
def add_project_member(request, project_id):
    """
    Legacy endpoint for adding a project member.
    Duplicates functionality in ProjectMemberAPIView.
    """
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    is_admin = ProjectMember.objects.filter(
        project=project, 
        user=request.user, 
        role__in=['OWNER', 'ADMIN']
    ).exists()
    
    if not is_admin:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    
    user_email = request.data.get('email')
    role = request.data.get('role', 'MEMBER')
    
    if not user_email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        user = User.objects.get(email=user_email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    if ProjectMember.objects.filter(project=project, user=user).exists():
        return Response({"error": "User is already a member"}, status=status.HTTP_400_BAD_REQUEST)
    
    
    member = ProjectMember.objects.create(
        project=project,
        user=user,
        role=role
    )
    
    
    ProjectActivity.objects.create(
        project=project,
        performed_by=request.user,
        description=f"Added {user.email} as {role}"
    )
    
    return Response({
        "status": "success",
        "member": {
            "id": member.id,
            "user_id": str(user.id),
            "email": user.email,
            "role": member.role
        }
    }, status=status.HTTP_201_CREATED)