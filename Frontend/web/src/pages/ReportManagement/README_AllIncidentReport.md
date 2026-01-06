# All Incident Report Component - Complete Setup Guide

## Overview
The `AllIncidentReport.jsx` component is a comprehensive incident report management system for CityVetCare. It provides functionality to view, filter, search, and manage all incident reports with real-time data from the backend API.

## Features
- ✅ Real-time incident report fetching from backend API
- ✅ Advanced search and filtering (by status, type, priority)
- ✅ Sortable data table with multiple sort options
- ✅ Detailed report view modal
- ✅ Create new incident reports
- ✅ Responsive design with Tailwind CSS
- ✅ Status tracking and priority management
- ✅ CORS-enabled backend integration

## Prerequisites

### Frontend Requirements
- Node.js (v16 or higher)
- npm or yarn package manager
- React 19.x
- Vite 6.x

### Backend Requirements
- PHP 7.4 or higher
- MySQL/MariaDB database
- XAMPP/WAMP (or similar) for local development
- Apache with mod_rewrite enabled

## Installation & Setup

### 1. Frontend Setup

#### Install Dependencies
```bash
cd Frontend/web
npm install
```

#### Environment Configuration
The `.env` file is already configured at `Frontend/web/.env`:
```env
VITE_API_URL=http://localhost/CityVetCare/Backend/routes
```

Adjust the URL if your backend is hosted differently:
- For XAMPP: `http://localhost/CityVetCare/Backend/routes`
- For PHP built-in server: `http://localhost:8000/routes`
- For production: `https://yourdomain.com/api/routes`

#### Start Development Server
```bash
npm run dev
```
The app will run on `http://localhost:5173`

### 2. Backend Setup

#### Database Setup
1. Create the database:
```sql
CREATE DATABASE cityvetcare_db;
USE cityvetcare_db;
```

2. Run the schema from `Database/schema.sql`:
```bash
mysql -u root -p cityvetcare_db < Database/schema.sql
```

Or import via phpMyAdmin.

#### Configure Database Connection
Edit `Backend/config/database.php` if needed:
```php
private $host = "127.0.0.1";
private $db_name = "cityvetcare_db";
private $username = "root";
private $password = "";
```

#### XAMPP/WAMP Setup
1. Copy the entire `CityVetCare` folder to your web root:
   - XAMPP: `C:/xampp/htdocs/CityVetCare`
   - WAMP: `C:/wamp64/www/CityVetCare`

2. Start Apache and MySQL services

3. Test the backend API:
   ```
   http://localhost/CityVetCare/Backend/routes/incidents.php
   ```

#### Alternative: PHP Built-in Server
```bash
cd Backend
php -S localhost:8000
```
Then update `.env` to use `http://localhost:8000/routes`

## Project Structure

```
CityVetCare/
├── Frontend/web/
│   ├── src/
│   │   ├── pages/ReportManagement/
│   │   │   └── AllIncidentReport.jsx          # Main component
│   │   ├── components/
│   │   │   ├── Header.jsx                      # App header
│   │   │   └── ReportManagement/
│   │   │       ├── Drawer.jsx                  # Navigation drawer
│   │   │       └── NewReportModal.jsx          # New report form
│   │   └── utils/
│   │       ├── api.js                          # API service layer
│   │       ├── constants.js                    # App constants
│   │       ├── dateUtils.js                    # Date utilities
│   │       └── validation.js                   # Form validation
│   └── .env                                     # Environment config
│
└── Backend/
    ├── routes/
    │   ├── incidents.php                       # Incidents API
    │   ├── catchers.php                        # Catchers API
    │   ├── dashboard.php                       # Dashboard API
    │   └── auth.php                            # Auth API
    ├── models/
    │   ├── Incident.php                        # Incident model
    │   ├── CatcherTeam.php                     # Catcher team model
    │   └── Schedule.php                        # Schedule model
    ├── config/
    │   └── database.php                        # DB connection
    ├── middleware/
    │   └── cors.php                            # CORS handler
    └── .htaccess                               # Apache routing
```

## Component Usage

### Basic Usage
```jsx
import AllIncidentReport from './pages/ReportManagement/AllIncidentReport';

function App() {
  return <AllIncidentReport />;
}
```

### API Integration
The component automatically fetches data from the backend API on mount. It uses the `apiService` from `utils/api.js`:

```javascript
// Fetch all incidents
const response = await apiService.incidents.getAll();

// Create new incident
await apiService.incidents.create(incidentData);
```

## Features Breakdown

### 1. Search & Filter
- **Search**: Real-time search across incident type, reporter, location, and animal type
- **Status Filter**: Filter by Pending, In Progress, Verified, or Resolved
- **Type Filter**: Filter by incident type (Bite Incident, Stray Animal, etc.)
- **Sort Options**: Sort by date, priority, status, or type

### 2. Data Display
- Responsive data table with all incident information
- Color-coded status badges (yellow=pending, blue=in progress, orange=verified, green=resolved)
- Priority indicators (low, medium, high, critical)
- Quick stats dashboard showing counts by status

### 3. Report Details Modal
Click the eye icon on any report to view:
- Basic information (reporter, date, location)
- Incident details (status, priority, animal info)
- Full description
- Injury reports
- Assigned team information

### 4. Create New Report
Click "New Report" button to open the form with fields for:
- Incident type and location
- Animal information (type, count)
- Reporter details (name, contact, address)
- Incident severity and description
- Injury details

## API Endpoints

### Get All Incidents
```
GET /Backend/routes/incidents.php
```

### Get Single Incident
```
GET /Backend/routes/incidents.php?id={id}
```

### Create Incident
```
POST /Backend/routes/incidents.php
Content-Type: application/json

{
  "title": "Bite Incident",
  "description": "Dog bite incident near market",
  "location": "Purok 4, Barangay San Juan",
  "status": "pending",
  "priority": "high",
  "reporter_name": "John Doe",
  "reporter_contact": "09123456789",
  "incident_date": "2025-11-26 14:30:00"
}
```

### Update Incident
```
PUT /Backend/routes/incidents.php
Content-Type: application/json

{
  "id": 1,
  "status": "verified",
  "assigned_catcher_id": 2
}
```

## Troubleshooting

### CORS Issues
If you see CORS errors in the browser console:
1. Verify `cors.php` is included in route files
2. Check `.htaccess` configuration
3. Ensure frontend URL is in `$allowed_origins` array in `cors.php`

### API Connection Failed
1. Verify XAMPP/WAMP services are running
2. Check the API URL in `.env` file
3. Test backend directly: `http://localhost/CityVetCare/Backend/routes/incidents.php`
4. Check PHP error logs for database connection issues

### Database Errors
1. Verify database exists: `cityvetcare_db`
2. Check credentials in `config/database.php`
3. Ensure tables are created (run `schema.sql`)
4. Check MySQL is running on port 3306

### Empty Data/Loading Issues
1. Open browser DevTools Console for errors
2. Check Network tab for failed API requests
3. Component will fall back to sample data if API fails
4. Verify backend is returning proper JSON response

## Styling Customization

The component uses Tailwind CSS classes. Key color scheme:
- Primary color: `#FA8630` (orange)
- Hover color: `#E87928`
- Background: `#E8E8E8`

To customize, modify the Tailwind classes or add custom CSS.

## Dependencies

### NPM Packages Used
```json
{
  "@heroicons/react": "^2.2.0",
  "axios": "^1.13.2",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.2",
  "tailwindcss": "^4.1.8"
}
```

All dependencies are already listed in `package.json`.

## Production Deployment

### Frontend Build
```bash
cd Frontend/web
npm run build
```
Output will be in `dist/` folder.

### Backend Deployment
1. Upload Backend folder to your web server
2. Update database credentials in `config/database.php`
3. Update CORS origins in `middleware/cors.php`
4. Ensure `.htaccess` is uploaded and Apache mod_rewrite is enabled
5. Update frontend `.env.production` with production API URL

## Support & Documentation

- Backend API: See `Backend/README.md`
- Database Schema: See `DATABASE_SETUP.md`
- Overall Setup: See `SETUP.md`

## License
© 2025 CityVetCare. All rights reserved.
