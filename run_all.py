import subprocess

# Start EVAC Map app on port 5001
subprocess.Popen(['python3', 'evac-app.py'])

# Start Draft Map app on port 5002
subprocess.Popen(['python3', 'draft-app.py'])