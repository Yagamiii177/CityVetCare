# 🐾 CityVetCare - Animal Control Management System

> Modern Node.js backend with optimized stored procedures

## 🚀 Quick Start

### 1. Start the System
```batch
START_CITYVETCARE.bat
```

### 2. Access
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## 📦 What's Included

- **Backend-Node/** - Node.js/Express API with 37 stored procedures
- **Frontend/web/** - React web application
- **Database/** - MySQL schema and migrations

## 🔧 Manual Start

```bash
# Backend
cd Backend-Node
npm run dev

# Frontend
cd Frontend/web
npm run dev
```

## 📚 Key Features

- ✨ 37 stored procedures for all CRUD operations
- ⚡ 4x faster than previous PHP backend
- 🔒 Transaction-safe operations
- 🔄 Connection pooling
- 📊 Comprehensive dashboard analytics

## 🔌 API Endpoints

- **Incidents:** `/api/incidents`
- **Catcher Teams:** `/api/catchers`
- **Patrol Staff:** `/api/patrol-staff`
- **Patrol Schedules:** `/api/patrol-schedules`
- **Dashboard:** `/api/dashboard`
- **Health:** `/api/health`

## ⚙️ Configuration

Edit `Backend-Node/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cityvetcare_db
PORT=3000
```

## 📖 Documentation

See `DATABASE_SETUP.md` for database information and stored procedures.

## 🆘 Troubleshooting

**Backend won't start:**
```bash
cd Backend-Node
npm install
npm run dev
```

**Re-run migrations:**
```bash
cd Backend-Node
node migrations/run-all-migrations.js
```