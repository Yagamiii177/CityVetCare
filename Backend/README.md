# CityVetCare Backend API

Complete backend API for the CityVetCare web application with PHP and MySQL.

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.php          # Database connection configuration
├── models/
│   ├── Incident.php          # Incident model with CRUD operations
│   ├── CatcherTeam.php       # Catcher team model
│   └── Schedule.php          # Schedule model
├── routes/
│   ├── incidents.php         # Incident endpoints
│   ├── dashboard.php         # Dashboard statistics
│   ├── catchers.php          # Catcher teams & schedules
│   └── auth.php              # Authentication endpoints
├── middleware/
│   └── cors.php              # CORS configuration
├── utils/
│   └── helpers.php           # Helper functions
├── .htaccess                 # Apache URL rewriting
└── index.php                 # Main API entry point
```

## 🚀 Setup Instructions

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server (with mod_rewrite enabled)
- Composer (optional, for future dependencies)

### Installation Steps

1. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u root -p < ../Database/schema.sql
   ```

2. **Configure Database Connection**
   
   Edit `Backend/config/database.php` and update the database credentials:
   ```php
   private $host = "localhost";
   private $db_name = "cityvetcare_db";
   private $username = "root";
   private $password = "your_password";
   ```

3. **Apache Configuration**
   
   Ensure your Apache has mod_rewrite enabled:
   ```bash
   # On Ubuntu/Debian
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   
   # On Windows (XAMPP), it's usually enabled by default
   ```

4. **Set Permissions** (Linux/Mac only)
   ```bash
   chmod 755 Backend/
   chmod 644 Backend/.htaccess
   ```

5. **Test API**
   
   Navigate to: `http://localhost/CityVetCareWeb/Backend/`
   
   You should see:
   ```json
   {
     "message": "CityVetCare API",
     "version": "1.0.0",
     "endpoints": { ... }
   }
   ```

## 📡 API Endpoints

### Base URL
```
http://localhost/CityVetCareWeb/Backend/api
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

### Incidents

#### Get All Incidents
```http
GET /api/incidents
GET /api/incidents?status=pending
GET /api/incidents?priority=high
GET /api/incidents?search=dog
```

#### Get Single Incident
```http
GET /api/incidents?id=1
```

#### Create Incident
```http
POST /api/incidents
Content-Type: application/json

{
  "title": "Stray dog reported",
  "description": "Large dog near park",
  "location": "Central Park",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "status": "pending",
  "priority": "medium",
  "reporter_name": "John Doe",
  "reporter_contact": "09171234567",
  "incident_date": "2025-11-26 10:00:00"
}
```

#### Update Incident
```http
PUT /api/incidents
Content-Type: application/json

{
  "id": 1,
  "title": "Updated title",
  "status": "in_progress",
  "assigned_catcher_id": 1
}
```

#### Delete Incident
```http
DELETE /api/incidents
Content-Type: application/json

{
  "id": 1
}
```

### Catcher Teams

#### Get All Teams
```http
GET /api/catchers
GET /api/catchers?status=active
```

#### Get Single Team
```http
GET /api/catchers?id=1
```

#### Create Team
```http
POST /api/catchers
Content-Type: application/json

{
  "team_name": "Delta Team",
  "leader_name": "John Smith",
  "contact_number": "09171234567",
  "email": "delta@example.com",
  "status": "active",
  "members_count": 5
}
```

### Schedules

#### Get All Schedules
```http
GET /api/schedules
GET /api/schedules?catcher_team_id=1
GET /api/schedules?date=2025-11-26
GET /api/schedules?status=scheduled
```

#### Create Schedule
```http
POST /api/schedules
Content-Type: application/json

{
  "catcher_team_id": 1,
  "incident_id": 1,
  "scheduled_date": "2025-11-26",
  "scheduled_time": "09:00:00",
  "end_time": "11:00:00",
  "status": "scheduled",
  "notes": "Bring safety equipment"
}
```

### Dashboard

#### Get Dashboard Statistics
```http
GET /api/dashboard
```

Returns:
```json
{
  "summary": {
    "total_incidents": 10,
    "pending_incidents": 3,
    "in_progress_incidents": 2,
    "resolved_incidents": 5,
    "active_teams": 3
  },
  "incident_stats": { ... },
  "today_schedules": [ ... ],
  "recent_incidents": [ ... ]
}
```

## 🔧 Configuration

### CORS Settings

Update allowed origins in `Backend/middleware/cors.php`:
```php
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://your-production-domain.com'
];
```

### Frontend Connection

The frontend is configured to connect via `Frontend/web/src/utils/api.js`.

Update the API URL in `Frontend/web/.env`:
```env
VITE_API_URL=http://localhost/CityVetCareWeb/Backend/api
```

## 🔐 Security Notes

1. **Change default database credentials** in production
2. **Implement JWT tokens** for authentication (current implementation is simplified)
3. **Add rate limiting** to prevent abuse
4. **Enable HTTPS** in production
5. **Validate and sanitize** all user inputs (basic sanitization is implemented)
6. **Use prepared statements** (already implemented to prevent SQL injection)

## 🧪 Testing

Test endpoints using:
- **Postman**: Import endpoints and test
- **cURL**: 
  ```bash
  curl -X GET http://localhost/CityVetCareWeb/Backend/api/incidents
  ```
- **Browser**: For GET requests only

## 📝 Common Issues

### 1. "Database connection failed"
- Check database credentials in `config/database.php`
- Ensure MySQL service is running
- Verify database exists

### 2. "404 Not Found"
- Check `.htaccess` file exists
- Verify mod_rewrite is enabled
- Check file permissions

### 3. "CORS errors in frontend"
- Verify frontend URL is in CORS allowed origins
- Check that CORS headers are being sent

### 4. "Access forbidden"
- Check file permissions (755 for directories, 644 for files)
- Verify Apache configuration allows .htaccess

## 🔄 Database Schema

The database schema is located in `Database/schema.sql` and includes:
- Users table
- Incidents table
- Catcher teams table
- Schedules table
- Stray animals table
- Adoptions table
- Vaccinations table
- Campaigns table

## 📚 Resources

- [PHP PDO Documentation](https://www.php.net/manual/en/book.pdo.php)
- [RESTful API Best Practices](https://restfulapi.net/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 👥 Support

For issues or questions, please create an issue in the repository.
