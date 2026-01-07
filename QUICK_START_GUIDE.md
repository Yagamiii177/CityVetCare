# 🚀 CityVetCare Quick Start Guide

**Updated:** January 7, 2026

## ✅ System Status: READY TO RUN

All components analyzed, fixed, and verified. Your system is production-ready!

---

## 📋 Prerequisites

Before running the system, ensure you have:

- ✅ Node.js v18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ Git installed (optional)

---

## 🔧 Initial Setup (One-time only)

### 1. Database Setup

```bash
# Navigate to backend
cd Backend-Node

# Run database setup script
node setup-database.js
```

This will create:

- Database: `cityvetcare_db`
- All required tables
- Initial schema

### 2. Backend Dependencies

```bash
# Install backend dependencies (if not already installed)
cd Backend-Node
npm install
```

### 3. Frontend Dependencies

```bash
# Install frontend dependencies (if not already installed)
cd Frontend/web
npm install
```

---

## 🚀 Running the System

### Option 1: Using Batch Files (Recommended)

**Start Everything:**

```bash
# From root directory
START_SYSTEM.bat
```

**Just Backend:**

```bash
BACKEND_MANAGER.bat
```

**Just Frontend:**

```bash
cd Frontend/web
npm run dev
```

### Option 2: Manual Start

**Terminal 1 - Backend:**

```bash
cd Backend-Node
npm start
# Or for development with auto-restart:
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd Frontend/web
npm run dev
```

---

## 🌐 Access URLs

Once running, access the application at:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/

---

## 🔐 Default Login Credentials

Create admin account via:

```bash
cd Backend-Node
node -e "import('./routes/auth.js');"
```

Or use the API:

```bash
POST http://localhost:3000/api/auth/create-account
{
  "full_name": "Admin User",
  "username": "admin",
  "password": "admin123",
  "role": "veterinarian",
  "userType": "admin"
}
```

---

## 🧪 Testing the System

### Quick Health Check

```bash
# Check backend health
curl http://localhost:3000/api/health

# Or use browser:
# Open http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-07T10:00:00.000Z",
  "uptime": 12.345,
  "database": "connected"
}
```

### Test Database Connection

```bash
cd Backend-Node
node verify-system-status.js
```

### Run Test Scripts

```bash
# Test all endpoints
node test-backend.js

# Test incident reporting
node test-incident-api.js

# Test clinic map
node test-clinic-map-complete.js
```

---

## 📁 Directory Structure

```
CityVetCare/
├── Backend-Node/          # Node.js API Server
│   ├── config/           # Database & config
│   ├── routes/           # API endpoints
│   ├── models/           # Data models
│   ├── middleware/       # Auth & validation
│   └── server.js         # Main server
│
├── Frontend/web/         # React Web App
│   └── src/
│       ├── pages/        # Route pages
│       ├── components/   # Reusable UI
│       └── utils/        # API & helpers
│
└── Database/             # SQL schemas
    └── schema.sql        # Database structure
```

---

## 🛠️ Common Issues & Solutions

### Issue: Port Already in Use

**Backend (Port 3000):**

```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Frontend (Port 5173):**

```bash
# Windows - Find and kill process
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: Database Connection Failed

1. Check MySQL is running:

```bash
# Windows
net start MySQL80
```

2. Verify credentials in `.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cityvetcare_db
```

3. Test connection:

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Issue: Dependencies Not Found

```bash
# Reinstall backend dependencies
cd Backend-Node
rm -rf node_modules package-lock.json
npm install

# Reinstall frontend dependencies
cd Frontend/web
rm -rf node_modules package-lock.json
npm install
```

### Issue: Module Not Found Errors

Make sure you're in the correct directory:

```bash
# For backend commands
cd c:\Users\Shad\Desktop\CityVetCare\CityVetCare\Backend-Node

# For frontend commands
cd c:\Users\Shad\Desktop\CityVetCare\CityVetCare\Frontend\web
```

---

## 📊 System Features

### 1. Report Management

- Incident reporting (web & mobile)
- Status tracking (Pending → Verified → Scheduled → Resolved)
- Image upload support
- Map-based location selection
- Real-time dashboard

### 2. Clinic Registration

- Private clinic management
- Interactive map view
- Status tracking (Active, Pending, Suspended)
- Permit & accreditation tracking
- Inspection management

### 3. Stray Animal Management

- Animal capture tracking
- Adoption management
- Redemption requests
- Statistics & logs

### 4. Campaign Management

- Announcements
- Reading materials
- Educational content

### 5. Vaccination Management

- Vaccination records
- Schedule tracking
- Pet owner management

---

## 🔄 Development Workflow

### Making Changes

**Backend Changes:**

```bash
cd Backend-Node
npm run dev  # Auto-restarts on file changes
```

**Frontend Changes:**

```bash
cd Frontend/web
npm run dev  # Hot reload enabled
```

### Building for Production

**Frontend:**

```bash
cd Frontend/web
npm run build
# Output in: Frontend/web/dist
```

**Backend:**

```bash
cd Backend-Node
npm start  # Production mode
```

---

## 📝 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cityvetcare_db

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📚 API Documentation

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/create-account` - Register

### Incidents

- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `GET /api/incidents/:id` - Get incident
- `PUT /api/incidents/:id` - Update incident
- `PATCH /api/incidents/:id/status` - Update status

### Clinics

- `GET /api/clinics` - List clinics
- `POST /api/clinics` - Register clinic
- `GET /api/clinics/:id` - Get clinic details
- `PUT /api/clinics/:id` - Update clinic

### Dashboard

- `GET /api/dashboard` - Get statistics

For complete API documentation, visit: http://localhost:3000/

---

## ✅ Verification Checklist

After starting the system, verify:

- [ ] Backend server running on port 3000
- [ ] Frontend dev server running on port 5173
- [ ] Database connected successfully
- [ ] No console errors in backend terminal
- [ ] No console errors in browser
- [ ] Can access http://localhost:5173
- [ ] API responds at http://localhost:3000/api/health

---

## 🎯 Next Steps

1. **Start the system** using `START_SYSTEM.bat`
2. **Access the web app** at http://localhost:5173
3. **Create an admin account** via API or test script
4. **Login and explore** the dashboard
5. **Test features** (incident reporting, clinic map, etc.)

---

## 📞 System Information

- **Backend Framework:** Node.js + Express
- **Frontend Framework:** React 19 + Vite
- **Database:** MySQL 8.0
- **Authentication:** JWT
- **File Upload:** Multer
- **Maps:** Leaflet + React-Leaflet
- **UI Library:** Ant Design + Tailwind CSS

---

## 🎓 Additional Resources

- [SYSTEM_ANALYSIS_COMPLETE.md](SYSTEM_ANALYSIS_COMPLETE.md) - Complete analysis report
- [Backend README](Backend-Node/README.md) - Backend documentation
- [Frontend README](Frontend/web/WEB_README.md) - Frontend documentation
- Test scripts in root directory (test-\*.js)

---

**System Status:** ✅ READY
**Last Verified:** January 7, 2026
**Version:** 3.1.0

🎉 **Your CityVetCare system is ready to use!**
