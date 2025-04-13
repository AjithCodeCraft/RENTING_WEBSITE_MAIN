# Rental Website Setup Guide

[![Django](https://img.shields.io/badge/Django-REST-green.svg)](https://www.django-rest-framework.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)](https://nextjs.org/)

A practical guide to setting up the Rental Website application with minimal configuration.

## Project Structure
```
RENTING_WEBSITE_MAIN/
├── backend/    # Django REST API
└── frontend/   # Next.js application
```

## Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/AjithCodeCraft/RENTING_WEBSITE_MAIN
cd RENTING_WEBSITE_MAIN
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver
```

The backend server will start at http://localhost:8000

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend application will be available at http://localhost:3000

## Troubleshooting Tips

- Ensure both backend and frontend are running simultaneously in separate terminal windows
- Check console for any error messages
- If API calls are failing, verify the backend server is running and accessible
- For database connection issues, check your database configuration in backend settings

## Additional Information

The frontend communicates with the backend API to fetch and manage rental listings. Make sure the backend is properly configured and running before accessing the frontend application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under AJITH S
