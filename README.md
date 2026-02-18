# solo-project-3

# Deployment Documentation: Fitness Tracker
Live Application
Domain Name: fitnesstracker.online

Registrar: Namecheap (or whichever registrar you used for your .online domain)

Hosting Provider: Render (Web Service)

SSL/HTTPS: Enabled via Render Managed Certificates

# Tech Stack
Frontend: HTML5, CSS3 (Vibrant Teal/Coral Theme), Vanilla JavaScript (ES6+)

Backend: Python 3.x using the Flask framework

Production Server: Gunicorn (Green Unicorn)

Database: PostgreSQL (Relational SQL Database)

# Database Architecture
Type: PostgreSQL

Hosting: Render Managed PostgreSQL

Initialization: The database is initialized with a seed_db.py script to ensure a minimum of 30 records are present upon deployment.

Connection: The backend connects to the database using psycopg2-binary via an internal connection string for optimized performance.

# Deployment & Updates
Continuous Deployment: This repository is linked to Render. Any git push to the main branch automatically triggers a new build and deployment.

Build Process: 1.  Render installs dependencies via pip install -r requirements.txt.
2.  The application entry point is api.py.

Update Strategy: To update the app, changes are committed locally and pushed to GitHub. Render handles the rolling update to ensure zero downtime.

# Configuration & Secrets
Environment Variables: Sensitive data and configuration settings are managed via Render's Environment tab. No secrets are hard-coded into the repository.

Managed Secrets:

DATABASE_URL: The internal PostgreSQL connection string used by the Flask app.

PORT: Dynamically assigned by Render to ensure the web service binds to the correct port.

Client-Side Persistence: User preferences (specifically Page Size) are persisted using Browser Cookies, allowing settings to remain consistent across sessions.
