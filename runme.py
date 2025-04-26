import os
import subprocess
import sys

# Path configurations
BASE_PATH = r"C:\Users\ajith\OneDrive\Desktop\RENTING_WEBSITE_MAIN"
BACKEND_PATH = os.path.join(BASE_PATH, "backend", "Rental_project")
FRONTEND_PATH = os.path.join(BASE_PATH, "frontend")

def run_backend():
    """Run backend in a new terminal window"""
    backend_cmds = [
        f'cd /d "{BACKEND_PATH}"',
        'call venv\\Scripts\\activate',
        'python manage.py runserver',
        'pause'  # Keeps window open after command completes
    ]
    subprocess.Popen(
        f'cmd /k "{ " & ".join(backend_cmds) }"',
        shell=True,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )

def run_frontend():
    """Run frontend in a new terminal window"""
    frontend_cmds = [
        f'cd /d "{FRONTEND_PATH}"',
        'npm run dev',
        'pause'  # Keeps window open after command completes
    ]
    subprocess.Popen(
        f'cmd /k "{ " & ".join(frontend_cmds) }"',
        shell=True,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )

if __name__ == "__main__":
    # Run both servers in separate terminals
    run_backend()
    run_frontend()
    
    print("Both servers started in separate terminal windows!")
    print("You can close this window now.")