# 🚀 Quick Setup Guide

## Prerequisites
- XAMPP/WAMP (Apache + MySQL + PHP)
- Node.js (v16 or higher)
- Git

## 📦 Installation Steps

### 1. Clone & Navigate
```bash
cd CityVetCareWeb
```

### 2. Database Setup

Start XAMPP/WAMP and:

```bash
# Open MySQL
mysql -u root -p

# Import schema
source Database/schema.sql

# OR use phpMyAdmin
# Import Database/schema.sql file
```

Default credentials created:
- **Username**: `admin`
- **Password**: `admin123`

### 3. Backend Configuration

Edit `Backend/config/database.php`:
```php
private $host = "localhost";
private $db_name = "cityvetcare_db";
private $username = "root";
private $password = ""; // Your MySQL password
```

**Important**: Place the project in your web server directory:
- XAMPP: `C:\xampp\htdocs\CityVetCareWeb`
- WAMP: `C:\wamp64\www\CityVetCareWeb`

### 4. Frontend Setup

```bash
cd Frontend/web
npm install
```

Edit `Frontend/web/.env` if needed:
```env
VITE_API_URL=http://localhost/CityVetCareWeb/Backend/api
```

### 5. Start Development

**Terminal 1 - Frontend:**
```bash
cd Frontend/web
npm run dev
```
Frontend: http://localhost:5174

**Terminal 2 - Backend:**
Make sure Apache is running via XAMPP/WAMP

Test API: http://localhost/CityVetCareWeb/Backend/

## ✅ Verify Installation

### Test Backend API
Open browser: `http://localhost/CityVetCareWeb/Backend/`

Should show:
```json
{
  "message": "CityVetCare API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Test Database Connection
Open: `http://localhost/CityVetCareWeb/Backend/api/incidents`

Should return incidents list (may be empty or with sample data)

### Test Frontend
Open: `http://localhost:5174`

Should show your React app

## 🔧 Common Issues

### "Database connection failed"
✅ Check MySQL is running in XAMPP/WAMP
✅ Verify credentials in `Backend/config/database.php`
✅ Ensure database `cityvetcare_db` exists

### "404 Not Found" on backend
✅ Check project is in htdocs/www folder
✅ Verify Apache is running
✅ Check `.htaccess` exists in Backend folder

### CORS errors
✅ Check frontend URL in `Backend/middleware/cors.php`
✅ Clear browser cache

### Frontend can't connect to API
✅ Verify `VITE_API_URL` in `.env`
✅ Check backend is accessible at that URL
✅ Restart frontend dev server after changing .env

## 📱 Next Steps

1. ✅ Setup complete
2. Import more test data if needed
3. Connect React pages to API endpoints
4. Test all features
5. Deploy to production

## 🆘 Need Help?

Check detailed documentation:
- `Backend/README.md` - API documentation
- `README.md` - Full project overview
- `Database/schema.sql` - Database structure

## 🎯 Quick Test Commands

```bash
# Test incidents endpoint
curl http://localhost/CityVetCareWeb/Backend/api/incidents

# Test dashboard
curl http://localhost/CityVetCareWeb/Backend/api/dashboard

# Test login
curl -X POST http://localhost/CityVetCareWeb/Backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📊 Project Structure Summary

```
CityVetCareWeb/
├── Frontend/web/        → React app (Port 5174)
├── Backend/            → PHP API (Apache)
└── Database/           → MySQL schema
```

Happy coding! 🎉
