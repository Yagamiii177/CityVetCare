# Mobile App Connection Setup Guide

## 🔧 Backend Server Status
✅ Backend is running on: `http://localhost:3000`
✅ Your PC IP Address: `192.168.0.108`

## 📱 Configure API URL Based on Your Device

### Option 1: Android Emulator (Default)
Already configured! Uses: `http://10.0.2.2:3000/api`

### Option 2: Physical Device (Android/iOS)
**If you're testing on a real phone/tablet:**

1. Open: `Frontend/mobile/config/api-config.js`
2. Find line ~15 that says: `return 'http://10.0.2.2:3000/api';`
3. Replace it with: `return 'http://192.168.0.108:3000/api';`
4. **Important:** Make sure your phone and PC are on the SAME WiFi network!

### Option 3: iOS Simulator
Uses: `http://localhost:3000/api` (automatically detected)

## 🧪 Test the Connection

### Step 1: Verify Backend is Running
```bash
# Open browser and visit:
http://localhost:3000/api/health
```

You should see: `{"status":"OK","timestamp":"...","message":"CityVetCare API is running"}`

### Step 2: Test Registration from Mobile App
1. Open the mobile app
2. Click "Register" 
3. Fill in all fields
4. Click "Create Account"

If it fails, check the console logs for detailed error messages.

### Step 3: Test with Browser (Verify Backend Works)
Open PowerShell and run:
```powershell
$body = @{
  username='testuser2026'
  password='password123'
  email='test2026@example.com'
  full_name='Test User'
  contact_number='09123456789'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

If this works but the app doesn't, it's a connection issue.

## 🐛 Troubleshooting

### Error: "Cannot connect to server"
**Causes:**
1. Backend server is not running
2. Wrong IP address in config
3. Phone and PC on different WiFi networks
4. Firewall blocking the connection

**Solutions:**
1. Start backend: `cd Backend-Node && node server.js`
2. Check IP in `api-config.js` matches `192.168.0.108`
3. Connect phone to same WiFi as PC
4. Temporarily disable firewall or add port 3000 exception

### Error: "Registration failed"
**Check console logs** in your mobile app terminal (where you run `npm start`)

Common issues:
- Backend returned an error (check backend terminal)
- Database connection issue
- Missing required fields

### Error: "Network request failed"
- The mobile app cannot reach the backend server
- Check if backend is running: `http://localhost:3000/api/health`
- For physical device, use your PC's IP: `http://192.168.0.108:3000/api`

## ✅ Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:3000/api/health
```

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@test.com","full_name":"Test User","contact_number":"09123456789"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2024","password":"password123"}'
```

## 📝 Current Configuration

**Backend Server:** `http://localhost:3000` ✅ Running
**Mobile App Default:** `http://10.0.2.2:3000/api` (Android Emulator)
**Physical Device URL:** `http://192.168.0.108:3000/api` (Your PC's IP)

## 🚀 Start Everything

**Terminal 1 - Backend:**
```bash
cd Backend-Node
node server.js
```

**Terminal 2 - Mobile App:**
```bash
cd Frontend/mobile
npm start
# or
npx expo start
```

Then press:
- `a` for Android Emulator
- `i` for iOS Simulator
- Scan QR code for physical device
