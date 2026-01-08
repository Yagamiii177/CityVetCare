# 🚀 CityVetCare - Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ Git (optional, for version control)

## 5-Minute Setup

### 1️⃣ Database Setup (2 minutes)

```bash
# Open MySQL command line
mysql -u root -p

# Create database
CREATE DATABASE cityvetcare_db;
exit;

# Import schema
mysql -u root -p cityvetcare_db < Database/schema.sql
```

### 2️⃣ Backend Setup (1 minute)

```bash
cd Backend-Node
npm install
copy .env.example .env
# Edit .env: Set your DB_PASSWORD
npm run migrate
npm start
```

Backend running at: http://localhost:3000

### 3️⃣ Frontend Web Setup (1 minute)

```bash
cd Frontend/web
npm install
copy .env.example .env
# .env should have: VITE_API_URL=http://localhost:3000/api
npm run dev
```

Web app running at: http://localhost:5173

### 4️⃣ Test (1 minute)

Open browser: http://localhost:5173

## 🎯 Even Easier: One-Click Start

**Windows Users:**
```bash
# Double-click START.bat in project root
START.bat
```

This will:
- ✅ Check Node.js installation
- ✅ Install dependencies if needed
- ✅ Create .env files if missing
- ✅ Start backend and frontend
- ✅ Open browser automatically

## 🔧 Configuration

### Backend (.env)
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=cityvetcare_db
PORT=3000
```

### Frontend Web (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📱 Mobile App (Optional)

```bash
cd Frontend/mobile
npm install
# Edit config/api.js with your backend URL
npm start
```

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or change PORT in Backend-Node/.env
```

### Database connection failed?
- ✅ Check MySQL is running
- ✅ Verify credentials in .env
- ✅ Ensure database exists: `SHOW DATABASES;`

### Frontend can't connect to backend?
- ✅ Backend must be running first
- ✅ Check VITE_API_URL in Frontend/web/.env
- ✅ Clear browser cache

## 📚 Next Steps

1. ✅ Read the full [README.md](README.md)
2. ✅ Explore [API Documentation](Backend-Node/README.md)
3. ✅ Review [Database Setup](DATABASE_SETUP.md)
4. ✅ Check [Code Cleanup Summary](CODE_CLEANUP_SUMMARY.md)

## 🎉 You're Ready!

Your CityVetCare system is now running. Start by:
- 📱 Creating incident reports
- 👥 Managing catcher teams
- 📊 Viewing dashboard statistics
- 📍 Tracking incidents on the map

---

**Need help?** Check the main README.md or review the troubleshooting section above.
