"""ASGI application entry point for uvicorn deployment.

This module provides the ASGI application that uvicorn expects.
It properly configures Django and provides the ASGI application.
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import Django first
import django
django.setup()

# Now import the ASGI application
from django.core.asgi import get_asgi_application

# Create the ASGI application
application = get_asgi_application()

# Alias for uvicorn (uvicorn expects 'app')
app = application
