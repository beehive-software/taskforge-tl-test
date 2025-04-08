from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from apps.tasks.views import task_list, tasks_by_priority, mark_task_complete
from apps.accounts.views import login_view, register_view

urlpatterns = [
    path('admin/', admin.site.urls),
    
    
    path('api/', include('api.urls')),
    
    path('tasks/', task_list, name='task-list'),
    path('tasks/by-priority/', tasks_by_priority, name='tasks-by-priority'),
    path('tasks/<uuid:task_id>/mark_complete/', mark_task_complete, name='mark-task-complete'),
    
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    from django.views.generic import TemplateView
    
    
    urlpatterns += [
        path('404/', TemplateView.as_view(template_name='404.html'), name='404'),
        path('500/', TemplateView.as_view(template_name='500.html'), name='500'),
    ]