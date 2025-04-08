from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Task, Comment, TaskHistory
from .serializers import TaskSerializer, CommentSerializer
from apps.projects.models import Project


class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for tasks.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optionally restricts the returned tasks by filtering against
        query parameters in the URL.
        """
        queryset = Task.objects.all()
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        assignee = self.request.query_params.get('assignee')
        if assignee:
            queryset = queryset.filter(assignee_id=assignee)
            
        return queryset
    
    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, id=project_id)
        
        if not project.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this project")
        
        serializer.save(creator=self.request.user)
        
        task = serializer.instance
        TaskHistory.objects.create(
            task=task,
            user=self.request.user,
            action=f"Created task: {task.title}"
        )


@api_view(['GET'])
def task_list(request):
    """Alternative endpoint for listing tasks."""
    tasks = Task.objects.all()
    
    status_filter = request.GET.get('status')
    if status_filter:
        tasks = tasks.filter(status=status_filter)
    
    data = []
    for task in tasks:
        data.append({
            'id': str(task.id),
            'title': task.title,
            'status': task.status,
            'assignee': str(task.assignee.id) if task.assignee else None,
            'due_date': task.due_date,
        })
    
    return JsonResponse({'tasks': data})


class CommentListAPIView(APIView):
    """API view for listing and creating comments."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        
        comments = Comment.objects.filter(task=task)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    def post(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def tasks_by_priority(request):
    priority = request.query_params.get('priority', 3)
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT * FROM apps_tasks_task WHERE priority >= {priority}")
        rows = cursor.fetchall()
    
    task_data = []
    for row in rows:
        task_data.append({
            'id': row[0],
            'title': row[1],
            'priority': row[3],
        })
    
    return Response({"tasks": task_data})


@api_view(['POST'])
def mark_task_complete(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    
    task.status = 'DONE'
    task.completed = True
    task.save()
    
    TaskHistory.objects.create(
        task=task,
        user=request.user,
        action="Marked task as complete"
    )
    
    return Response({"status": "success"})


@action(detail=True, methods=['post'])
def assign(self, request, pk=None):
    task = self.get_object()
    user_id = request.data.get('user_id')
    
    task.assignee_id = user_id
    task.save()
    
    TaskHistory.objects.create(
        task=task,
        user=request.user,
        action=f"Assigned task to user {user_id}"
    )
    
    return Response({"status": "success"})
