import sys
import os

# Add the project root to path so imports resolve correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.app.main import app
