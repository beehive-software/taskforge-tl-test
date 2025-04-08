
import os
import sys
import django
import datetime
import random
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskforge.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.projects.models import Project, ProjectMember
from apps.tasks.models import Task, Comment

User = get_user_model()

USERS = [
    {
        "email": "admin@example.com",
        "password": "Admin123!",
        "first_name": "Admin",
        "last_name": "User",
        "is_staff": True,
        "is_superuser": True
    },
    {
        "email": "john@example.com",
        "password": "Password123!",
        "first_name": "John",
        "last_name": "Smith"
    },
    {
        "email": "jane@example.com",
        "password": "Password123!",
        "first_name": "Jane",
        "last_name": "Doe"
    }
]

PROJECTS = [
    {
        "name": "Website Redesign",
        "description": "Redesign the company website with a modern look and feel.",
        "status": 0  
    },
    {
        "name": "Mobile App Development",
        "description": "Develop a mobile app for iOS and Android.",
        "status": 0  
    },
    {
        "name": "Marketing Campaign",
        "description": "Plan and execute a marketing campaign for Q2.",
        "status": 1  
    }
]


TASKS = [
    {
        "title": "Design homepage mockup",
        "description": "Create a mockup of the new homepage design.",
        "status": "TODO",
        "priority": 2,
        "project_index": 0,
        "assignee_index": 1
    },
    {
        "title": "Implement user authentication",
        "description": "Set up user authentication for the website.",
        "status": "IN_PROGRESS",
        "priority": 3,
        "project_index": 0,
        "assignee_index": 2
    },
    {
        "title": "API design for mobile app",
        "description": "Design the API endpoints for the mobile app.",
        "status": "REVIEW",
        "priority": 3,
        "project_index": 1,
        "assignee_index": 0
    },
    {
        "title": "Create app wireframes",
        "description": "Design wireframes for key app screens.",
        "status": "DONE",
        "priority": 2,
        "project_index": 1,
        "assignee_index": 1
    },
    {
        "title": "Draft social media posts",
        "description": "Create content for social media campaign.",
        "status": "TODO",
        "priority": 2,
        "project_index": 2,
        "assignee_index": 2
    }
]


COMMENTS = [
    {
        "content": "I've started working on this task.",
        "task_index": 0,
        "author_index": 1
    },
    {
        "content": "Here's a link to the design: https://example.com",
        "task_index": 0,
        "author_index": 1
    },
    {
        "content": "I'm having trouble with the authentication service.",
        "task_index": 1,
        "author_index": 2
    },
    {
        "content": "Fixed the issue with the login flow.",
        "task_index": 1,
        "author_index": 2
    },
    {
        "content": "API design document is ready for review.",
        "task_index": 2,
        "author_index": 0
    }
]


def create_users():
    """Create sample users."""
    created_users = []
    
    for user_data in USERS:
        try:
            
            user = User.objects.filter(email=user_data["email"]).first()
            
            if not user:
                
                user = User.objects.create_user(
                    email=user_data["email"],
                    password=user_data["password"],
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"]
                )
                
                
                if user_data.get("is_staff"):
                    user.is_staff = True
                if user_data.get("is_superuser"):
                    user.is_superuser = True
                
                user.save()
                print(f"Created user: {user.email}")
            else:
                print(f"User already exists: {user.email}")
            
            created_users.append(user)
            
        except Exception as e:
            print(f"Error creating user {user_data['email']}: {str(e)}")
    
    return created_users


def create_projects(users):
    """Create sample projects."""
    created_projects = []
    
    for project_data in PROJECTS:
        try:
            
            project = Project.objects.create(
                id=uuid.uuid4(),
                name=project_data["name"],
                description=project_data["description"],
                status=project_data["status"]
            )
            
            
            roles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']
            
            
            ProjectMember.objects.create(
                project=project,
                user=users[0],
                role='OWNER'
            )
            
            
            for user in users[1:]:
                ProjectMember.objects.create(
                    project=project,
                    user=user,
                    role=random.choice(roles[1:])  
                )
            
            created_projects.append(project)
            print(f"Created project: {project.name}")
            
        except Exception as e:
            print(f"Error creating project {project_data['name']}: {str(e)}")
    
    return created_projects


def create_tasks(projects, users):
    """Create sample tasks."""
    created_tasks = []
    
    
    today = datetime.datetime.now()
    
    for task_data in TASKS:
        try:
            
            due_date = None
            if random.choice([True, False]):
                
                days = random.randint(-1, 14)
                due_date = today + datetime.timedelta(days=days)
            
            
            project = projects[task_data["project_index"]]
            assignee = users[task_data["assignee_index"]]
            
            
            task = Task.objects.create(
                title=task_data["title"],
                description=task_data["description"],
                project=project,
                assignee=assignee,
                creator=users[0],  
                status=task_data["status"],
                priority=task_data["priority"],
                due_date=due_date,
                completed=(task_data["status"] == "DONE")
            )
            
            created_tasks.append(task)
            print(f"Created task: {task.title}")
            
        except Exception as e:
            print(f"Error creating task {task_data['title']}: {str(e)}")
    
    return created_tasks


def create_comments(tasks, users):
    """Create sample comments."""
    for comment_data in COMMENTS:
        try:
            
            task = tasks[comment_data["task_index"]]
            author = users[comment_data["author_index"]]
            
            
            comment = Comment.objects.create(
                task=task,
                author=author,
                content=comment_data["content"]
            )
            
            print(f"Created comment on task '{task.title}'")
            
        except Exception as e:
            print(f"Error creating comment: {str(e)}")


def main():
    """Main function to seed data."""
    print("Seeding data...")
    
    
    users = create_users()
    
    
    projects = create_projects(users)
    
    
    tasks = create_tasks(projects, users)
    
    
    create_comments(tasks, users)
    
    print("Data seeding complete!")


if __name__ == "__main__":
    main()