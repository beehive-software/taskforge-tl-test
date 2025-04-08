from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.tasks.views import TaskViewSet, CommentListAPIView
from apps.projects.views import ProjectViewSet


router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('tasks/<uuid:task_id>/comments/', CommentListAPIView.as_view(), name='task-comments'),
]

from apps.tasks.views import task_list, mark_task_complete

urlpatterns += [
    path('tasks/list/', task_list, name='tasks-list-alt'),
    path('tasks/<uuid:task_id>/complete/', mark_task_complete, name='complete-task'),
]

from apps.accounts.views import login_view, register_view, refresh_token_view

urlpatterns += [
    path('auth/login/', login_view, name='api-login'),
    path('auth/register/', register_view, name='api-register'),
    path('auth/refresh-token/', refresh_token_view, name='refresh-token'),
]