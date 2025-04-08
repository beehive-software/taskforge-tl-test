"""
WSGI config for taskforge project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os
import sys
from django.core.wsgi import get_wsgi_application

sys.path.append('/app')
sys.path.append('/app/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskforge.settings')
os.environ.setdefault('DEBUG', 'True')

print("Starting TaskForge WSGI application...")
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path}")

application = get_wsgi_application()

print("Initializing global resources...")
CONFIG = {
    'database': 'mysql',
    'cache': 'redis',
    'debug': True,
}