# 🐾 CityVetCare - Stray Animal Management System

**Version:** 3.1.0 ✨ (Updated January 6, 2026)  
**Status:** ✅ Production Ready - All Systems Operational

A comprehensive web and mobile application system for managing stray animal incidents, reports, catcher teams, and patrol schedules in urban areas.

---

## 🎉 Latest Updates (v3.1.0)

### ✨ What's New:
- **Dedicated Patrol Management API** - New `/api/patrol-staff` and `/api/patrol-schedules` endpoints
- **Enhanced UI** - Improved patrol assignment with search, filters, and better visuals
- **Better Organization** - Dedicated models for PatrolStaff and PatrolSchedule
- **Fixed Routing** - All API endpoints properly connected

📖 **Full Details:** [SYSTEM_FIX_COMPLETE.md](SYSTEM_FIX_COMPLETE.md)  
⚡ **Quick Guide:** [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

## 🏗️ System Architecture

- **Backend**: Node.js/Express REST API with MySQL database
- **Frontend Web**: React + Vite with Tailwind CSS
- **Frontend Mobile**: React Native (Expo) for iOS and Android
- **Database**: MySQL with optimized stored procedures

## 📁 Project Structure

```
CityVetCare/
├── Backend-Node/          # Node.js REST API
│   ├── config/           # Database configuration
│   ├── models/           # Data models
│   ├── routes/           # API endpoints
│   ├── utils/            # Utilities (logger, validators)
│   └── migrations/       # Database migrations
├── Frontend/
│   ├── mobile/          # React Native mobile app (Expo)
│   └── web/             # React web application (Vite)
└── Database/            # SQL schema and migrations
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+
- **For mobile development**: Expo CLI

### 1. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE cityvetcare_db;
exit;

# Import schema
mysql -u root -p cityvetcare_db < Database/schema.sql
```

### 2. Backend Setup

```bash
cd Backend-Node
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate

# Start server
npm start
# Development mode with auto-reload: npm run dev
```

Server runs on `http://localhost:3000`

### 3. Frontend Web Setup

```bash
cd Frontend/web
npm install

# Configure environment
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

Web app runs on `http://localhost:5173`

### 4. Frontend Mobile Setup

```bash
cd Frontend/mobile
npm install

# Update API configuration
# Edit config/api.js with your backend URL

# Start Expo development server
npm start
```

## 📚 API Documentation

**Base URL**: `http://localhost:3000/api`

### Endpoints

#### Incidents
- `GET /incidents` - Get all incidents with pagination and filters
- `GET /incidents/:id` - Get incident by ID
- `POST /incidents` - Create new incident
- `PUT /incidents/:id` - Update incident
- `DELETE /incidents/:id` - Delete incident
- `GET /incidents/status-counts` - Get count by status

#### Catcher Teams
- `GET /catchers` - Get all catcher teams
- `GET /catchers/:id` - Get catcher team by ID
- `POST /catchers` - Create catcher team
- `PUT /catchers/:id` - Update catcher team
- `DELETE /catchers/:id` - Delete catcher team

#### Patrol Staff
- `GET /patrol-staff` - Get all patrol staff ✨ NEW
- `GET /patrol-staff/:id` - Get patrol staff by ID ✨ NEW
- `POST /patrol-staff` - Create patrol staff ✨ NEW
- `PUT /patrol-staff/:id` - Update patrol staff ✨ NEW
- `DELETE /patrol-staff/:id` - Delete patrol staff ✨ NEW

#### Patrol Schedules
- `GET /patrol-schedules` - Get all schedules ✨ NEW
- `GET /patrol-schedules/:id` - Get schedule by ID ✨ NEW
- `GET /patrol-schedules/incident/:id` - Get by incident ✨ NEW
- `POST /patrol-schedules` - Create schedule ✨ NEW
- `PUT /patrol-schedules/:id` - Update schedule ✨ NEW
- `DELETE /patrol-schedules/:id` - Delete schedule ✨ NEW

#### Dashboard
- `GET /dashboard` - Get dashboard statistics

#### Health Check
- `GET /health` - Server health status

## 🌟 Features

### For Citizens (Mobile App)
- 📱 Report stray animal incidents with photos
- 📍 GPS location tracking for reports
- 🗺️ View incidents on map
- 📊 Track report status in real-time
- 📢 Receive notifications on report updates

### For Administrators (Web Dashboard)
- 📋 Manage all incident reports
- ✅ Verify and approve reports
- 👥 Assign catcher teams to incidents
- 📅 Schedule patrol activities
- 📈 View analytics and statistics
- 🗺️ Monitor incidents on interactive map

### Technical Features
- 🔐 Professional logging system
- ✅ Environment variable validation
- 🚀 Optimized database queries with stored procedures
- 🔄 Connection pooling for better performance
- 🛡️ SQL injection prevention
- 🌐 CORS protection
- 📱 Responsive design for all devices

## 🔧 Configuration

### Backend Environment Variables

Create `Backend-Node/.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cityvetcare_db

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

### Frontend Web Environment Variables

Create `Frontend/web/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_MODE=development
```

### Mobile App Configuration

Edit `Frontend/mobile/config/api.js`:

```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000';

// For iOS Simulator
// const API_BASE_URL = 'http://localhost:3000';

// For Physical Device (use your computer's IP)
// const API_BASE_URL = 'http://192.168.1.100:3000';
```

## 🏭 Production Deployment

### Backend

```bash
cd Backend-Node
NODE_ENV=production npm start
```

**Important for Production:**
- Set secure JWT secrets
- Configure proper database credentials
- Set up proper CORS origins
- Enable HTTPS
- Set up proper logging and monitoring

### Frontend Web

```bash
cd Frontend/web
npm run build
# Deploy the 'dist' folder to your web server
```

### Mobile App

```bash
cd Frontend/mobile
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

See [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed build instructions.

## 🔍 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database `cityvetcare_db` exists
- Run migrations: `npm run migrate`

### Frontend can't connect to backend
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env`
- Check CORS settings in backend
- Clear browser cache

### Mobile app can't connect
- Use correct IP address in `config/api.js`
- For Android emulator, use `10.0.2.2`
- For physical device, use computer's IP on same network
- Check firewall settings

## 📦 Dependencies

### Backend
- express - Web framework
- mysql2 - MySQL client
- cors - CORS middleware
- dotenv - Environment variables
- bcrypt - Password hashing
- jsonwebtoken - JWT authentication

### Frontend Web
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- leaflet - Maps
- tailwindcss - CSS framework
- recharts - Charts

### Frontend Mobile
- react-native - Mobile framework
- expo - Development platform
- react-navigation - Navigation
- react-native-maps - Maps
- expo-location - Location services
- expo-camera - Camera access

## 🧪 Development

### Backend Development Mode
```bash
cd Backend-Node
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Web Development
```bash
cd Frontend/web
npm run dev  # Hot module replacement enabled
```

### Mobile Development
```bash
cd Frontend/mobile
npm start    # Opens Expo DevTools
# Press 'a' for Android, 'i' for iOS
```

## 📝 Code Quality

- Professional logging system with different log levels
- Environment variable validation
- Proper error handling
- Clean code structure
- No excessive console logs in production
- Secure database queries using stored procedures

## 🔐 Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets in production
- Validate all user inputs
- Use prepared statements/stored procedures
- Implement proper authentication and authorization
- Keep dependencies updated
- Use HTTPS in production

## 📖 Additional Documentation

- [Backend API Documentation](Backend-Node/README.md)
- [Frontend Web Guide](Frontend/web/README.md)
- [Mobile App Guide](Frontend/mobile/README.md)
- [Database Setup Guide](DATABASE_SETUP.md)

## 📄 License

MIT

## 👥 Contributors

CityVetCare Development Team

## 📞 Support

For issues, questions, or contributions, please open an issue in the repository.

---

**Built with ❤️ for better urban animal management**
