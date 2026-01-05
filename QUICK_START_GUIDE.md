# CityVetCare System - Quick Start Guide

## 🚀 Starting the System

### Option 1: Automatic Startup (Recommended)
Simply double-click one of these files:
- **STARTCITYVET.bat** (for Command Prompt)
- **STARTCITYVET.ps1** (for PowerShell)

The script will automatically:
1. ✅ Install dependencies (if needed)
2. ✅ Start Backend API Server (port 3000)
3. ✅ Start Web Application (port 5173)
4. ✅ Start Mobile Application (Expo)
5. ✅ Open your web browser

### Option 2: Manual Startup

#### 1. Start Backend Server
```bash
cd Backend-Node
npm install          # First time only
node server.js       # or: npm start
```
Backend will run on: http://localhost:3000

#### 2. Start Web Application
```bash
cd Frontend/web
npm install          # First time only
npm run dev
```
Web will run on: http://localhost:5173

#### 3. Start Mobile Application
```bash
cd Frontend/mobile
npm install          # First time only
npm start
```
Scan the QR code with Expo Go app on your phone

## 🔗 Access URLs

- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **Web App**: http://localhost:5173
- **Mobile App**: Scan QR code in Expo terminal

## 👤 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Test User (iPhone)
- **Username**: `iphoneuser`
- **Password**: `iphone123`

### Veterinarian Account
- **Username**: `vet1`
- **Password**: `vet123`

## 📱 Mobile App Setup

1. Install **Expo Go** on your phone:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Make sure your phone and computer are on the same WiFi network

3. Scan the QR code from the Expo terminal

4. The app will load and you can login with any account above

## 🛠️ Troubleshooting

### Port Already in Use
If you see "port already in use" error:
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Or kill all node processes
taskkill /F /IM node.exe
```

### Backend Not Starting
1. Check if MySQL is running
2. Verify `.env` file exists in `Backend-Node` folder
3. Check database connection settings in `.env`

### Web Not Loading
1. Clear browser cache
2. Try incognito/private window
3. Check if port 5173 is available

### Mobile Can't Connect
1. Update the API URL in `Frontend/mobile/config/api.js`
2. Use your computer's local IP (not localhost)
3. Example: `http://192.168.1.100:3000/api`

## 📊 System Architecture

```
┌─────────────────┐
│   Web Browser   │ ← http://localhost:5173
└────────┬────────┘
         │
         ↓
┌─────────────────┐     ┌──────────────┐
│  Mobile Device  │────→│   Backend    │ ← http://localhost:3000
│   (Expo Go)     │     │  (Node.js)   │
└─────────────────┘     └──────┬───────┘
                               │
                               ↓
                        ┌──────────────┐
                        │    MySQL     │
                        │   Database   │
                        └──────────────┘
```

## 🧪 Testing the System

Run comprehensive tests:
```bash
node test-complete-system.js
```

Test mobile functionality:
```bash
node test-mobile-simulation.js
```

## 📝 Features

### Web Application
- ✅ Admin Dashboard
- ✅ Incident Report Management
- ✅ Interactive Map View
- ✅ Catcher Team Management
- ✅ Patrol Schedule Management
- ✅ Real-time Status Updates

### Mobile Application
- ✅ Report Stray Animals
- ✅ Upload Photos
- ✅ Location Pin on Map
- ✅ View Report Status
- ✅ User Authentication
- ✅ Push Notifications

## 🔐 Security Notes

- Change default passwords in production
- Keep `.env` file secure (never commit to git)
- Use HTTPS in production
- Enable CORS only for trusted domains

## 📞 Support

For issues or questions, check:
- Backend logs in Backend-Node console
- Web logs in browser developer console (F12)
- Mobile logs in Expo console

---

**System Version**: b7b38a6 (Restored Working Version)  
**Last Updated**: January 5, 2026
