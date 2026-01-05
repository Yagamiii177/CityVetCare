# CityVetCare Mobile App Setup Guide

Complete guide to running the React Native mobile application with Expo.

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm** or **yarn**: Package manager
- **Expo Go App**: Install on your physical device
  - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS](https://apps.apple.com/app/expo-go/id982107779)
- **Android Studio** (optional for Android Emulator)
- **Xcode** (optional for iOS Simulator - Mac only)

## Quick Start

### 1. Install Dependencies

```bash
cd Frontend/mobile
npm install
```

### 2. Configure API Connection

**IMPORTANT**: Update the API base URL based on how you're running the app:

Edit `config/api-config.js`:

#### For Android Emulator (Default):
```javascript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

#### For iOS Simulator:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

#### For Physical Device:
1. Find your computer's IP address:
   - **Windows**: Open Command Prompt, run `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Open Terminal, run `ifconfig`, look for "inet"

2. Update config:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
// Example: const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

### 3. Start Backend Server

The mobile app requires the Node.js backend to be running:

```bash
cd Backend-Node
npm install
npm run dev
```

Backend should start on `http://localhost:3000`

### 4. Start Mobile App

```bash
cd Frontend/mobile
npm start
```

This opens the Expo Developer Tools in your browser.

### 5. Run on Device/Emulator

#### Option A: Physical Device (Recommended)
1. Install **Expo Go** app on your phone
2. Scan the QR code from Expo Developer Tools
3. App will load on your device

#### Option B: Android Emulator
1. Start Android Studio
2. Launch an Android Virtual Device (AVD)
3. Press `a` in the Expo terminal

#### Option C: iOS Simulator (Mac only)
1. Press `i` in the Expo terminal
2. Simulator will launch automatically

## Features

### ✅ Authentication
- Login with demo accounts
- Guest access for reporting
- JWT token management
- Auto-refresh tokens

### ✅ Incident Reporting
- Report stray animals, bites, injured animals
- Upload up to 5 photos
- GPS location with reverse geocoding
- Offline support (saves locally, syncs when online)
- Form validation

### ✅ Offline Mode
- Detects network status
- Saves reports to local queue
- Auto-syncs when connection restored
- Visual offline indicator

## Demo Accounts

```
User Account:
Username: user1
Password: password123

Veterinarian:
Username: vet1
Password: password123

Admin:
Username: admin1
Password: password123
```

## Project Structure

```
mobile/
├── config/
│   └── api-config.js          # API endpoints and configuration
├── contexts/
│   └── AuthContext.js         # Authentication state management
├── services/
│   └── api.js                 # API service layer
├── screens/
│   ├── Main/
│   │   ├── LoginScreen.js    # Login interface
│   │   └── HomePageScreen.js
│   └── Incidents/
│       └── ReportIncident.js  # Incident reporting form
├── components/
│   └── BottomNavigation.js
├── assets/
│   └── icons/
├── App.js                      # Main app entry with navigation
└── package.json
```

## Troubleshooting

### Issue: "Network request failed"

**Solution**:
1. Check backend is running (`npm run dev` in Backend-Node)
2. Verify API_BASE_URL in `config/api-config.js`
3. For physical device, ensure computer and phone are on the same WiFi
4. Check firewall isn't blocking port 3000

### Issue: "Unable to resolve module"

**Solution**:
```bash
npm install
npx expo start --clear
```

### Issue: Camera/Location permissions not working

**Solution**:
1. Check app permissions in device settings
2. For emulator, ensure location services are enabled
3. Restart Expo and app

### Issue: Images not uploading

**Solution**:
1. Check image file size (backend may have limits)
2. Verify multer is configured in backend
3. Check network connection
4. Try fewer images first

### Issue: Offline mode not working

**Solution**:
1. Check AsyncStorage permissions
2. Clear app data: Settings > Apps > Expo Go > Clear Data
3. Reinstall Expo Go app

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/incidents` | GET | List incidents |
| `/api/incidents` | POST | Create incident (with images) |
| `/api/notifications` | GET | Get notifications |
| `/api/notifications/unread-count` | GET | Unread count |

## Development Tips

### Hot Reloading
- Save any file to automatically reload the app
- Press `r` in Expo terminal to manually reload

### Debugging
1. **Console Logs**: Check Expo DevTools or Metro Bundler terminal
2. **React DevTools**: Press `m` in terminal to open menu, enable debugging
3. **Network**: Use React Native Debugger or Flipper

### Testing on Different Devices
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios

# Web (for quick testing)
npm run web
```

## Building for Production

### Android APK
```bash
npm install -g eas-cli
eas build --platform android
```

### iOS App
```bash
eas build --platform ios
```

Follow Expo EAS Build documentation for complete deployment guide.

## Environment Variables

Create `.env` file in mobile folder (optional):

```env
API_BASE_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

## Common Commands

```bash
# Start development server
npm start

# Clear cache and restart
npx expo start --clear

# Update dependencies
npm run update

# Install specific Expo SDK version
npx expo install expo@~54.0.0

# Check for issues
npx expo-doctor
```

## Performance Tips

1. **Image Optimization**: Compress images before upload
2. **Bundle Size**: Keep dependencies minimal
3. **Memory**: Close unused apps on device/emulator
4. **Network**: Use WiFi for faster uploads

## Security Notes

- JWT tokens stored in AsyncStorage (encrypted on device)
- Offline queue encrypted in AsyncStorage
- HTTPS recommended for production
- Never commit API keys or secrets

## Support

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Issues**: Check Backend-Node logs for API errors

## Next Steps

1. ✅ Test login with demo accounts
2. ✅ Report an incident with photos
3. ✅ Test offline mode (airplane mode)
4. ✅ Check incident list and notifications
5. ⏳ Add more screens (My Reports, Profile, etc.)

---

**Last Updated**: January 2026  
**Expo SDK**: ~54.0  
**React Native**: 0.81.5
