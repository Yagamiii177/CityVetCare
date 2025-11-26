# CityVetCare Database Setup Instructions

## Quick Setup Guide

### Step 1: Import Database Schema

**Option A: Using phpMyAdmin (Recommended)**
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Login with username: `root`, password: (leave empty)
3. Click "Import" tab
4. Click "Choose File" and select: `Database/schema.sql`
5. Click "Go" button to import

**Option B: Using MySQL Command Line**
```bash
mysql -u root -p < Database/schema.sql
```
(Press Enter when asked for password - it's empty)

### Step 2: Verify Database Connection

1. Make sure Apache and MySQL are running in XAMPP/WAMP
2. Open your browser and visit: `http://localhost/CityVetCare/Backend/routes/health.php`
3. You should see a JSON response like:
```json
{
    "timestamp": "2025-11-26 12:00:00",
    "api_status": "online",
    "database": {
        "status": "connected",
        "name": "cityvetcare_db",
        "version": "10.4.32-MariaDB",
        "host": "127.0.0.1"
    }
}
```

### Step 3: Start Frontend Development Server

1. Open terminal/command prompt
2. Navigate to: `cd Frontend/web`
3. Install dependencies (first time only): `npm install`
4. Start dev server: `npm run dev`
5. Open browser to the URL shown (typically `http://localhost:5173`)

### Step 4: Test Login

Use the default admin credentials:
- **Username:** `admin`
- **Password:** `admin123`

## Configuration Summary

✅ **Database Configuration** (`Backend/config/database.php`)
- Host: `127.0.0.1`
- Database: `cityvetcare_db`
- Username: `root`
- Password: (empty)

✅ **API Endpoint** (`Frontend/web/.env`)
- API URL: `http://localhost/CityVetCare/Backend/api`

✅ **Health Check Endpoint**
- URL: `http://localhost/CityVetCare/Backend/routes/health.php`
- Tests database connectivity

## Database Tables Created

The schema creates 8 tables with sample data:
1. `users` - User accounts (includes admin user)
2. `catcher_teams` - Animal catcher teams (3 teams)
3. `incidents` - Stray animal incident reports (3 incidents)
4. `schedules` - Catcher team schedules (3 schedules)
5. `stray_animals` - Captured stray animal records
6. `adoptions` - Animal adoption records
7. `vaccinations` - Animal vaccination records
8. `campaigns` - Awareness/vaccination campaigns

## Troubleshooting

**If health check fails:**
- Verify XAMPP/WAMP MySQL service is running
- Check phpMyAdmin can connect: `http://localhost/phpmyadmin`
- Ensure database `cityvetcare_db` exists
- Verify MariaDB is running on port 3306

**If frontend can't connect to backend:**
- Check Apache is running
- Visit: `http://localhost/CityVetCare/Backend/index.php`
- Should show API information
- Verify `.env` file has correct `VITE_API_URL`
- Restart frontend dev server after changing `.env`

**If using PHP built-in server instead of XAMPP:**
1. Start PHP server: `cd Backend && php -S localhost:8000`
2. Update `.env`: `VITE_API_URL=http://localhost:8000/api`
3. Restart frontend dev server

## Next Steps

Once connected:
- Access the application at `http://localhost:5173`
- Login with admin credentials
- Explore the dashboards and modules
- Test incident reporting and management features
