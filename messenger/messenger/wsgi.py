"""
WSGI config for messenger project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/wsgi/
"""

import os
from configurations import importer
from configurations.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'messenger.settings')
os.environ.setdefault('DJANGO_CONFIGURATION', 'DEV')

importer.install()

application = get_wsgi_application()
