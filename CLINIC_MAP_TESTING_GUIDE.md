# Quick Testing Guide - Clinic Map

## Step-by-Step Testing

### 1. Start the Application

Make sure both backend and frontend are running:

```powershell
# Backend (should already be running on port 3000)
cd Backend-Node
npm start

# Frontend (should already be running on port 5173)
cd Frontend/web
npm run dev
```

### 2. Open Clinic Map Page

1. Navigate to: `http://localhost:5173`
2. Login if required
3. Go to: **Clinic Registration → Clinic Map**

### 3. Open Browser Console

- Press **F12** or **Ctrl+Shift+I**
- Click on the **Console** tab

### 4. What You Should See

#### Console Logs (Example):

```
🏥 Fetching clinic locations...
📦 Raw API response: {data: Array(2), status: 200, ...}
📊 Response data: (2) [{…}, {…}]
📈 Response data length: 2
🔄 Clinics data to transform: (2) [{…}, {…}]
🔄 transformClinics called with: (2) [{…}, {…}]
🎯 Transformed 2 clinics
✅ Transformed clinics: (2) [{…}, {…}]
📍 Clinics with coordinates: 2
📊 Status counts: {all: 2, Active: 2, Pending: 0, Inactive: 0, Suspended: 0}
🗺️ MAP RENDER STATE:
  - Loading: false
  - Total clinics: 2
  - Filtered clinics: 2
  - Error: null
  - Status filter: all
  - Search term:
🔍 Applying filters to 2 clinics
🎯 Status filter: all Search term:
🔵 Setting filtered clinics: 2
🗺️ Rendering markers for 2 clinics
  Clinic 1: Shady at 14.5857484 121.0001564
  Clinic 2: PawsnBoots at 13.63539597 123.19437236
```

#### On the Page:

- **Status Counters** at top should show:

  - All Clinics: **2**
  - Active: **2**
  - Pending: **0**
  - Inactive: **0**
  - Suspended: **0**

- **Map** should display:

  - 2 green pin markers (for Active status)
  - Markers at the coordinates shown in logs
  - Map should auto-center to show both markers

- **Clinic List** (sidebar) should show:
  - 2 clinic cards
  - Names: "Shady" and "PawsnBoots"
  - Status badges showing "Active"

### 5. Test Interactions

#### Click on a Marker:

- Popup should appear with clinic details
- Shows: Name, Address, Phone, Veterinarian, Status, Services

#### Click on Clinic in Sidebar:

- Card highlights with orange border
- Map centers on that clinic
- Zooms to level 15

#### Use Search Bar:

- Type "Shady" → Should show only Shady clinic
- Clear search → Should show both clinics again

#### Use Status Filters:

- Click "Pending" button → Should show 0 clinics (message: "No clinics found")
- Click "Active" button → Should show 2 clinics
- Click "All Clinics" button → Should show 2 clinics

#### Use Refresh Button:

- Click refresh icon
- Console should show fetching logs again
- Map should reload with same data

### 6. Troubleshooting

#### If No Clinics Appear:

**Check Console for Errors:**

```javascript
// Look for red error messages
// Common issues:
- API connection error
- Data transformation error
- Coordinate parsing error
```

**Check Network Tab:**

1. Open Network tab in browser DevTools
2. Look for request to: `/api/clinics/locations?status=all`
3. Click on it to see response
4. Should return Status: 200
5. Response should be array with 2 clinics

**Check React State:**

1. Install React DevTools browser extension
2. Open Components tab
3. Find `ClinicMap` component
4. Check state values:
   - `clinics`: should be array with 2 items
   - `filteredClinics`: should be array with 2 items
   - `loading`: should be false
   - `error`: should be null

#### If Markers Don't Show:

**Check Coordinates in Console:**

```
Look for: 📍 Clinics with coordinates: 2
Should NOT see: ⚠️ Clinic missing/invalid coordinates
```

**Check Map Bounds:**

```javascript
// In MapController, check if auto-centering is working
// Should see map adjust to fit both markers
```

**Check Leaflet CSS:**

```javascript
// Ensure leaflet.css is loaded
// Check browser Network tab for CSS files
```

### 7. Expected Results ✅

After following all steps, you should have:

- ✅ 2 clinics displayed on map
- ✅ 2 markers visible (green pins)
- ✅ 2 clinics listed in sidebar
- ✅ Clicking marker shows popup
- ✅ Clicking sidebar clinic centers map
- ✅ Search filtering works
- ✅ Status filtering works
- ✅ Refresh button reloads data

### 8. When to Create New Clinic

To test the "incident creation" pattern:

1. Go to **Clinic Registration → New Clinic**
2. Fill in all required fields
3. **Important:** Use the location picker to set coordinates
4. Submit the form
5. Go back to **Clinic Map**
6. Should see the new clinic on the map (if status is Active)

### 9. Cleanup (Optional)

To remove debug logs after confirming everything works:

1. Open `ClinicMap.jsx`
2. Search for `console.log`
3. Comment out or remove debug logs
4. Keep only important error logs

---

## Summary

The Clinic Map now works exactly like ReportManagement's Monitoring Incidents:

- Fetches data from backend
- Transforms to frontend format
- Applies filters
- Renders on interactive map
- Shows details on click
- Auto-centers and zooms

All debugging is in place to help identify any issues!
