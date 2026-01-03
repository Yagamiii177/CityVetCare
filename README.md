# 🐾 CityVetCare - Anti-Rabies Management System

**Naga City Veterinary Services - Anti Rabies Program**

A comprehensive full-stack application for managing anti-rabies programs, including incident reporting, vaccination management, stray animal tracking, and campaign management.

---

## 🚀 Quick Start - EASY SETUP!

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** (comes with Node.js)

### ⚡ Simple 3-Step Setup

1. **Setup Database**
   - Create a MySQL database named `cityvetcare`
   - Import the schema: Run `Database/schema.sql` in MySQL
   - Update credentials in `Backend-Node/config/database.js`

2. **Install & Start Everything**
   - Double-click `START.bat` in the project root folder
   - Select option **[4]** to install dependencies (first time only)
   - Select option **[1]** for Web App or **[2]** for Mobile App or **[3]** for Both

3. **Login & Use**
   - **Web:** Opens automatically at http://localhost:5173
   - **Mobile:** Scan QR code with Expo Go app
   - **Default Login:** Username: `admin` / Password: `admin123`

That's it! 🎉

---

## 📂 Project Structure

```
CityVetCare/
├── START.bat              # 🎯 Main launcher (Use this!)
├── Backend-Node/          # API Server (Port 3000)
├── Frontend/
│   ├── web/              # Dashboard (Port 5173)
│   └── mobile/           # Mobile App (Expo)
└── Database/             # MySQL Schema & Migrations
```

---

## 🖥️ System Components

### 1. Backend API (Node.js + Express)
- **Port:** 3000
- **URL:** http://localhost:3000
- JWT authentication, MySQL database, File uploads, Role-based access

### 2. Web Dashboard (React + Vite)
- **Port:** 5173
- **URL:** http://localhost:5173
- Admin dashboard, Incident management, Vaccination tracking, Analytics

### 3. Mobile App (React Native + Expo)
- **Platforms:** iOS & Android
- Public incident reporting, GPS tracking, Photo upload, Offline support

---

## 👤 Default Login Credentials

### Web Dashboard
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Veterinarian | `vet` | `vet123` |
| Catcher | `catcher` | `catcher123` |

⚠️ **Change passwords in production!**

---

## 📱 Mobile App Setup

### Option 1: Run on Emulator/Simulator
1. Start app with `START.bat` → option [2]
2. Press `a` for Android or `i` for iOS in Expo terminal

### Option 2: Run on Your Phone
1. Install **Expo Go** app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
2. Start app with `START.bat` → option [2]
3. Scan QR code shown in terminal
4. **Important:** Update IP address in `Frontend/mobile/config/api-config.js`
   - Find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Replace in config: `http://YOUR_IP:3000/api`

---

## 🎯 Features by Role

### 👥 Public/Guest (Mobile)
✓ Report incidents (stray animals, bites)
✓ View campaigns & events
✓ Register pets for vaccination

### 👤 Registered User
✓ All guest features
✓ Track report status
✓ Manage pet profiles

### 👨‍⚕️ Veterinarian
✓ Manage incidents
✓ Update vaccination records
✓ Access analytics

### 🚗 Catcher
✓ View assigned incidents
✓ Update status
✓ Manage patrols

### 👨‍💼 Admin
✓ Full system access
✓ User management
✓ System configuration

---

## 🛠️ START.bat Menu Options

```
[1] 🌐 Start Web Application (Dashboard)
[2] 📱 Start Mobile Application (Expo)
[3] 🚀 Start BOTH Web & Mobile
[4] 🔧 Install/Update Dependencies (Run first time!)
[5] ℹ️  System Information
[6] ❌ Exit
```

---

## 🐛 Common Issues & Solutions

### ❌ Port Already in Use
**Problem:** Error about port 3000 or 5173 being used

**Solution:** Close other apps using these ports, or restart your computer

### ❌ Cannot Connect to Database
**Problem:** Database connection failed

**Solution:**
1. Make sure MySQL is running
2. Check username/password in `Backend-Node/config/database.js`
3. Verify database `cityvetcare` exists

### ❌ Mobile App Won't Connect
**Problem:** Network request failed

**Solution:**
1. Update `Frontend/mobile/config/api-config.js`:
   - **Android Emulator:** Use `http://10.0.2.2:3000/api`
   - **iOS Simulator:** Use `http://localhost:3000/api`
   - **Physical Phone:** Use `http://YOUR_COMPUTER_IP:3000/api`
2. Make sure backend is running (port 3000)
3. Phone and computer must be on same WiFi

### ❌ Login Page Not Showing
**Problem:** Blank screen or login not displayed

**Solution:**
- **Web:** Press Ctrl+Shift+R to hard refresh browser
- **Mobile:** Restart Expo with `npx expo start --clear`
- Check if backend is running

### ❌ Dependencies Error
**Problem:** Module not found errors

**Solution:** Run `START.bat` → option [4] to install all dependencies

---

## 🔒 Security Features

✅ JWT-based authentication
✅ Password hashing (bcrypt)
✅ Role-based access control
✅ SQL injection prevention
✅ XSS protection
✅ Secure file uploads

---

## 📊 Technology Stack

### Backend
- Node.js + Express.js
- MySQL Database
- JWT Authentication
- Multer (File uploads)
- bcrypt (Password hashing)

### Web Frontend
- React 18
- Vite (Build tool)
- React Router
- Axios
- Tailwind CSS

### Mobile App
- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo Camera & Location

---

## 📈 System Status

✅ Backend API - Fully functional
✅ Web Dashboard - Complete with all modules
✅ Mobile App - With offline support
✅ Database - Complete schema
✅ Authentication - JWT implemented
✅ File Upload - Working
✅ Real-time Updates - Implemented

---

## 🔧 Manual Commands (If needed)

### Backend
```bash
cd Backend-Node
npm install          # Install dependencies
npm run dev          # Start with auto-reload
```

### Web
```bash
cd Frontend/web
npm install          # Install dependencies
npm run dev          # Start dev server
```

### Mobile
```bash
cd Frontend/mobile
npm install          # Install dependencies
npx expo start       # Start Expo dev server
```

---

## 📝 Configuration Files

### Backend Database Config
📁 `Backend-Node/config/database.js`
```javascript
module.exports = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'cityvetcare'
};
```

### Mobile API Config
📁 `Frontend/mobile/config/api-config.js`
```javascript
// Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// iOS Simulator
// const API_BASE_URL = 'http://localhost:3000/api';

// Physical Device (replace with YOUR IP)
// const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

---

## 📞 Support

Need help?
1. Check the **Common Issues** section above
2. Review `IMPLEMENTATION_GUIDE.md` for detailed docs
3. Contact your system administrator

---

## 🎯 Quick Tips

💡 **First time setup:** Run `START.bat` → [4] to install dependencies
💡 **Best experience:** Use option [3] to start both web and mobile
💡 **Stuck?** Try restarting: Close all terminals and run `START.bat` again
💡 **Mobile testing:** Use Android Emulator for easiest setup
💡 **Changed code?** Web auto-reloads, Mobile needs manual refresh (Ctrl+M → Reload)

---

## 🌐 Access URLs

| Component | URL | Notes |
|-----------|-----|-------|
| Backend API | http://localhost:3000 | API Server |
| Health Check | http://localhost:3000/api/health | Test if backend is running |
| Web Dashboard | http://localhost:5173 | Admin interface |
| Mobile App | Expo QR Code | Scan with Expo Go |

---

## 📖 Additional Documentation

- `IMPLEMENTATION_GUIDE.md` - Detailed technical documentation
- `DATABASE_SETUP.md` - Database setup instructions
- `MOBILE_IMPLEMENTATION.md` - Mobile app specifics
- `QUICK_START.md` - Quick setup guide

---

**Made with ❤️ for Naga City Anti-Rabies Program**

Version: 2.0
Last Updated: January 3, 2026

---

## 🚨 REMEMBER

1. ✅ Use `START.bat` for everything - it's your main control center
2. ✅ Run option [4] first time to install dependencies
3. ✅ Backend must be running for web/mobile to work
4. ✅ Change default passwords in production
5. ✅ Keep terminal windows open while using the system

**Happy coding! 🎉**
