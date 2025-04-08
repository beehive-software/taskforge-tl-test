# TaskForge

This repo is used as a test for tech lead candidates. It represents A task management system for teams.

## Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Docker (for MySQL database)

### Database Setup (MySQL with Docker)
1. Pull the MySQL Docker image:
   ```bash
   docker pull mysql:8.0
   ```
2. Create and run the MySQL container:
   ```bash
   docker run --name taskforge-mysql -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=taskforge -p 3306:3306 -d mysql:8.0
   ```
3. Verify the container is running:
   ```bash
   docker ps
   ```

### Backend Setup
1. Navigate to the backend directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: 
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create mock data using `python scripts/generate_data.py`
7. Start the server: `python manage.py runserver`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Features
- User management
- Project creation and management
- Task tracking with assignments
- Dashboard view