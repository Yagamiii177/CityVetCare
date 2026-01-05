# CityVetCare Web Dashboard

Modern web dashboard for incident reporting and monitoring system built with React 19, Vite, and Tailwind CSS 4.

## Features

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Veterinarian, Catcher, User)
- Automatic token refresh
- Secure session management

### ✅ Dashboard
- Real-time incident statistics
- Staff availability monitoring
- Verification queue metrics
- Activity trends (7-day view)
- Today's patrol schedules
- Recent incidents feed
- Auto-refresh every 30 seconds

### ✅ Interactive Map
- Leaflet.js with OpenStreetMap tiles (FREE - no API key needed)
- Marker clustering for better performance
- Status-based marker colors
- Priority-based marker sizing
- Click markers for incident details
- Filter by status and type
- Search incidents
- Real-time updates

### ✅ Incident Management
- View all incidents
- Pending verification queue (Veterinarians)
- Report history and audit trails
- Status tracking
- Priority management

## Tech Stack

- **React**: 19.1.0
- **Vite**: 6.3.5 (Fast build tool)
- **Tailwind CSS**: 4.1.8 (Utility-first CSS)
- **React Router**: 7.6.2 (Client-side routing)
- **Axios**: 1.13.2 (HTTP client)
- **Leaflet**: 1.9.4 + React Leaflet 5.0 (Maps)
- **Heroicons**: 2.2.0 (Icons)
- **Recharts**: 3.5.1 (Charts)
- **date-fns**: 4.1.0 (Date utilities)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on port 3000

### Installation

```bash
# Navigate to web directory
cd Frontend/web

# Install dependencies
npm install
```

### Configuration

Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

Default API URL: `http://localhost:3000/api`

### Development

```bash
# Start development server
npm run dev

# OR use the launcher script
START_WEB.bat
```

Web dashboard will be available at: http://localhost:5173

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
web/
├── src/
│   ├── pages/
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx           # New authentication page
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx       # Main dashboard with stats
│   │   ├── Map/
│   │   │   └── MonitoringMap.jsx       # Interactive incident map
│   │   ├── ReportManagement/
│   │   ├── StrayAnimalManagement/
│   │   ├── VaccinationManagement/
│   │   └── CampaignManagement/
│   ├── contexts/
│   │   └── AuthContext.jsx             # Global auth state
│   ├── hooks/
│   │   └── useAuth.js                  # Auth hook
│   ├── utils/
│   │   └── api-enhanced.js             # API client with interceptors
│   ├── components/
│   ├── App.jsx                          # Main app with routing
│   └── main.jsx                         # Entry point
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── START_WEB.bat                        # Windows launcher
```

## Available Routes

### Public Routes
- `/` - Old login page
- `/login` - New login page (with API integration)

### Protected Routes
- `/dashboard` - Main dashboard with real-time statistics
- `/map` - Interactive incident monitoring map
- `/all-incident-report` - All incidents list
- `/pending-verification` - Verification queue (Veterinarians only)
- `/monitoring-incidents` - Incident monitoring
- `/catcher-schedule` - Patrol scheduling

### Old Routes (Legacy)
- `/landing` - Landing page
- `/vaccination-dashboard` - Vaccination management
- `/stray-dashboard` - Stray animal management
- `/campaign-dashboard` - Campaign management
- `/report-dashboard` - Report management

## Demo Accounts

```
User Account:
Username: user1
Password: password123

Veterinarian:
Username: vet1
Password: password123

Administrator:
Username: admin1
Password: password123

Animal Catcher:
Username: catcher1
Password: password123
```

## Key Features Explained

### Authentication System
- Login with JWT tokens
- Tokens stored in localStorage
- Automatic token refresh on 401 errors
- Role-based access control via AuthContext
- Protected routes with React Router

### Dashboard
- **Metrics Cards**: Total incidents, pending verification, active patrols, available staff
- **Activity Trends**: 7-day line chart showing incident trends
- **Recent Incidents**: Last 5 reported incidents with status
- **Today's Patrols**: Scheduled patrols for current day
- **Auto-refresh**: Updates every 30 seconds

### Monitoring Map
- **Markers**: Color-coded by status (pending=yellow, verified=blue, in_progress=orange, resolved=green)
- **Clustering**: Automatically groups nearby markers
- **Filters**: Filter by status, incident type
- **Search**: Search incidents by title or location
- **Popups**: Click markers for incident details
- **Selected Detail**: Side panel with full incident information

## API Integration

### Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/dashboard/map-data` | GET | Map incidents data |
| `/api/incidents` | GET | List all incidents |
| `/api/incidents/:id` | GET | Get incident details |
| `/api/verifications/pending` | GET | Pending verification queue |
| `/api/notifications` | GET | User notifications |

### API Client Features
- Axios interceptors for request/response
- Automatic Bearer token injection
- Token refresh on 401 errors
- Error handling and retry logic
- Base URL configuration via env variable

## Troubleshooting

### Issue: "Network Error" or API calls fail

**Solution:**
1. Check backend is running: `cd Backend-Node && npm run dev`
2. Verify API URL in `.env` or default: `http://localhost:3000/api`
3. Check browser console for CORS errors
4. Ensure backend CORS allows `http://localhost:5173`

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Map not displaying

**Solution:**
1. Check browser console for Leaflet errors
2. Ensure incident data has valid latitude/longitude
3. Try refreshing the page
4. Clear browser cache

### Issue: Login not working

**Solution:**
1. Check Network tab for API response
2. Verify demo credentials
3. Check localStorage for existing tokens
4. Clear localStorage: `localStorage.clear()`

### Issue: Fast Refresh warnings

**Solution:**
- All components properly export only components
- Hooks are in separate files (`hooks/useAuth.js`)
- No warnings should appear - all fixed!

## Development Tips

### Hot Module Replacement (HMR)
- Save any file to see instant updates
- No page reload needed for most changes
- State is preserved during HMR

### Debugging
```javascript
// Check auth state
import { useAuth } from './hooks/useAuth';
const { user, isAuthenticated } = useAuth();
console.log('User:', user, 'Auth:', isAuthenticated);

// Check API calls
// Open browser DevTools > Network tab
```

### Code Quality
- ESLint configured for React best practices
- No unused variables warnings
- Fast Refresh enabled
- TypeScript-ready

## Environment Variables

Create `.env` file for custom configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Map Configuration
VITE_MAP_CENTER_LAT=14.5995
VITE_MAP_CENTER_LNG=120.9842
VITE_MAP_DEFAULT_ZOOM=13

# Feature Flags
VITE_ENABLE_AUTO_REFRESH=true
VITE_REFRESH_INTERVAL=30000
```

## Performance Optimization

### Current Optimizations
- ✅ Marker clustering for maps
- ✅ Lazy loading components
- ✅ Memoized callbacks with useCallback
- ✅ Optimized re-renders with proper dependencies
- ✅ Code splitting with React Router
- ✅ Vite's fast build and HMR

### Production Build
```bash
npm run build
# Creates optimized build in dist/

npm run preview
# Preview production build locally
```

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ 14+
- Mobile browsers: ✅ iOS Safari 14+, Chrome Android

## Scripts

```bash
# Development
npm run dev          # Start dev server (port 5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Deployment

### Netlify / Vercel
```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_API_URL=https://your-api.com/api
```

### Static Hosting
```bash
npm run build
# Upload dist/ folder to your hosting
```

## Security Notes

- ✅ JWT tokens in localStorage (consider httpOnly cookies for production)
- ✅ HTTPS recommended for production
- ✅ CORS properly configured
- ✅ No API keys in client code (using OpenStreetMap)
- ✅ Input sanitization on backend
- ✅ XSS protection via React

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Push notifications
- [ ] Advanced filtering and sorting
- [ ] Export reports (PDF, Excel)
- [ ] Offline support with Service Workers
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Internationalization (i18n)

## Support

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Leaflet**: https://leafletjs.com
- **React Leaflet**: https://react-leaflet.js.org

## License

MIT License - See LICENSE file for details

---

**Last Updated**: January 3, 2026  
**Version**: 1.0.0  
**React**: 19.1.0  
**Vite**: 6.3.5
