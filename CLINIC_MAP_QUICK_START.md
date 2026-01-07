# ClinicMap Quick Start Guide

## 🚀 Getting Started (3 Steps)

### Step 1: Database Setup (Already Done ✓)

The database has been successfully set up with:

- ✅ Updated private_clinic table schema
- ✅ 5 new supporting tables (map_view, location_history, inspection_report, permit_renewal, complaint)
- ✅ 5 sample clinics with coordinates in Manila area

### Step 2: Start Backend Server

```bash
cd Backend-Node
npm start
```

Server will run on: `http://localhost:3000`

### Step 3: Start Frontend

```bash
cd Frontend/web
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 📍 Access the Map

1. Open browser: `http://localhost:5173`
2. Login as admin
3. Navigate to: **Clinic Registration → Clinic Map**

## 🗺️ What You'll See

### Map Display

- 5 clinic markers in Manila/Metro Manila area
- Color-coded pins:
  - 🟢 Green = Active (4 clinics)
  - 🟡 Yellow = Temporarily Closed (1 clinic)

### Sample Clinics

1. **Manila Veterinary Clinic** (Ermita)
2. **Quezon City Pet Hospital** (Batasan Hills)
3. **Makati Animal Care Center** (Poblacion) ⚠️ Has expiring permits
4. **Pasig Paws & Claws Clinic** (Kapitolyo) - Temporarily Closed
5. **Taguig Veterinary Services** (Fort Bonifacio)

### Alert Panel

You'll see warnings for:

- Makati clinic has permits expiring within 30 days
- Makati clinic has inspection follow-up needed

## 🎮 Try These Features

### 1. Search

- Type "Manila" in search box
- See results filter automatically

### 2. Click a Marker

- Click any green pin on map
- See popup with clinic details
- View services, hours, contact info

### 3. Select from Sidebar

- Scroll clinic list on right
- Click any clinic card
- Map auto-zooms to that clinic

### 4. Use Filters

- Click "Filters" button
- Select a barangay (e.g., "Ermita")
- See only clinics in that area

### 5. Check Alerts

- Top panel shows monitoring alerts
- Red = Critical (expired)
- Yellow = Warning (expiring soon)
- Blue = Info (needs follow-up)

## 🔧 Common Tasks

### Add a New Clinic

1. Go to **Clinic Registration → Clinic List**
2. Click "Add New Clinic"
3. Fill in clinic details
4. **Important**: Add latitude and longitude for map display
5. Set status to "Active"
6. Save
7. Return to Clinic Map to see it appear

### Update Clinic Location

1. Edit clinic in Clinic List
2. Update address and coordinates
3. Save
4. Refresh Clinic Map

### View Clinic Details

- Click marker on map, OR
- Click clinic card in sidebar
- See full information in popup

## 📊 API Endpoints Available

Test these in browser or Postman:

```bash
# Get all clinics with coordinates
GET http://localhost:3000/api/clinics

# Get clinic statistics
GET http://localhost:3000/api/clinic-map/statistics

# Get monitoring alerts
GET http://localhost:3000/api/clinic-map/alerts

# Get barangay list
GET http://localhost:3000/api/clinic-map/barangays

# Get available services
GET http://localhost:3000/api/clinic-map/services

# Find nearby clinics (within 5km)
GET http://localhost:3000/api/clinic-map/nearby?lat=14.5995&lng=120.9842&radius=5
```

## 🛠️ Troubleshooting

### Map is blank

- Check browser console for errors
- Verify backend is running (http://localhost:3000/api/health)
- Check that sample clinics were added (should see 5 markers)

### No markers showing

- Verify clinics have latitude AND longitude
- Check that status is set (any status will show)
- Try clicking "Refresh" button

### Filters not working

- Clear all filters and try again
- Check browser console for errors
- Verify clinic data has the filtered field

### Backend errors

```bash
# Check if database is running
node -e "import('./config/database.js').then(({pool}) => { pool.query('SELECT 1').then(() => { console.log('DB OK'); pool.end(); }); });"

# Re-run schema update if needed
node update-clinic-schema.js

# Re-add sample data if needed
node add-sample-clinics.js
```

## 📚 More Information

- **Full Documentation**: See `docs/CLINIC_MAP_README.md`
- **Refactor Summary**: See `CLINIC_MAP_REFACTOR_SUMMARY.md`
- **Component Structure**: Browse `Frontend/web/src/components/ClinicRegistration/ClinicMap/`

## ✅ Verification Checklist

- [ ] Backend server running without errors
- [ ] Frontend dev server running
- [ ] Can access map page
- [ ] See 5 clinic markers on map
- [ ] Can click markers and see popups
- [ ] Can search and filter
- [ ] See alerts in top panel
- [ ] Sidebar shows clinic list
- [ ] Selecting clinic zooms map

If all checked ✅, the ClinicMap is working perfectly!

## 🎉 Success Indicators

You'll know everything is working when you see:

1. **Map loads** with Manila area centered
2. **5 markers** appear on the map
3. **Alert panel** shows 2-3 warnings
4. **Sidebar** lists 5 clinics
5. **Clicking marker** shows popup with clinic details
6. **Selecting clinic** in sidebar zooms the map

Enjoy your fully functional ClinicMap with monitoring! 🗺️✨
