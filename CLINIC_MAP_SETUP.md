# Clinic Map - Complete Setup & Usage

## ✅ What's Been Done

### 1. **Backend API** (Based on Incidents Pattern)

- **GET /api/clinics/locations** - Returns clinics with coordinates
  - Supports filters: `status`, `search`, `barangay`, `service`
  - Returns: `{ id, name, latitude, longitude, status, barangay, address, phone, veterinarian, services }`
- **GET /api/clinics/map/status-counts** - Returns counts by status

  - Returns: `{ all, Active, Pending, Inactive, Suspended }`

- **POST/PUT /api/clinics** - Create/update clinics with coordinates
  - Accepts: `barangay`, `latitude`, `longitude` fields
  - All data persists to database

### 2. **Frontend Components** (Based on MonitoringIncidents/AllIncidentReport Pattern)

- **ClinicMap.jsx** - Main map page with:

  - Interactive Leaflet map with clinic markers
  - Status count buttons (All, Active, Pending, Inactive, Suspended)
  - Search by name/address/barangay
  - Filter by barangay
  - Clinic list sidebar with auto-highlight
  - Auto-center map when clinic selected
  - Responsive grid layout (map + sidebar)

- **LocationPicker.jsx** - Interactive pin location component

  - Click "Pin Location" button to open full-screen map modal
  - Click on map to select clinic location
  - Displays selected coordinates
  - Integrated in NewClinic and EditClinic forms

- **NewClinic.jsx** - Now includes LocationPicker for coordinates
- **EditClinic.jsx** - Now includes LocationPicker for coordinates

### 3. **Database**

- All clinics stored in `private_clinic` table
- Fields: `clinic_id`, `clinic_name`, `address`, `barangay`, `latitude`, `longitude`, `status`, and more
- 5 sample clinics pre-loaded with coordinates

### 4. **Sample Data** (Pre-loaded)

```
1. Paws & Care Veterinary Clinic - Manila (14.5956, 120.9831) - Active
2. Metro Veterinary Hospital - Makati (14.5547, 121.0244) - Active
3. BGC Animal Care Center - Taguig (14.5176, 121.0509) - Active
4. Quezon City Pet Clinic - QC (14.676, 121.0437) - Pending
5. Pasig Veterinary Services - Pasig (14.5764, 121.0851) - Active
```

---

## 🚀 How to Use

### **Adding New Clinics with Map Coordinates**

1. **Go to Clinic List**

   - Sidebar → "Clinic List"
   - Click "New Clinic" button

2. **Fill Basic Info (Step 1)**

   - Clinic name, veterinarian, license, contact info

3. **Pin Location (Step 2)**

   - Click blue "Pin Location" button
   - Modal opens with interactive map
   - Click on map to place marker (centered on Manila by default)
   - Selected coordinates display at bottom
   - Click "Confirm Location" to save
   - Coordinates auto-populate the form

4. **Add Services (Step 3)**

   - Select services if needed

5. **Submit**
   - Click "Register Clinic"
   - Clinic created with coordinates

### **Viewing Clinics on Map**

1. **Go to Clinic Map**

   - Sidebar → "Smart Clinic Map"

2. **View Clinics**

   - Map shows markers for all clinics with coordinates
   - Status colors:
     - 🟢 Green = Active
     - 🟡 Yellow = Pending
     - ⚫ Gray = Inactive
     - 🔴 Red = Suspended

3. **Interact**

   - **Click status buttons** (All, Active, Pending, etc.) to filter
   - **Search** by clinic name, address, or barangay
   - **Filter by barangay** using Filters menu
   - **Click marker** on map to see popup details
   - **Click clinic in sidebar** to auto-center map

4. **View Details**
   - Click marker or sidebar clinic
   - Map centers and shows address, phone, vet name
   - Sidebar highlights selected clinic

---

## 📱 How It Works

### **Data Flow**

```
NewClinic/EditClinic Form
    ↓
LocationPicker Modal (interactive map)
    ↓
User clicks map location
    ↓
Coordinates saved to form
    ↓
POST/PUT to /api/clinics (with latitude, longitude, barangay)
    ↓
Database: private_clinic (coordinates stored)
    ↓
GET /api/clinics/locations (fetch markers)
    ↓
ClinicMap.jsx renders Leaflet map with markers
```

### **Architecture Pattern**

- Follows **MonitoringIncidents** pattern:
  - API endpoints with filtering
  - Frontend state management
  - Status counts
  - Search & filter
  - Interactive map
  - Sidebar list sync with map selection

---

## 🔧 API Endpoints Summary

```bash
# List clinics with coordinates (for map)
GET /api/clinics/locations?status=Active&search=Manila&barangay=Poblacion

# Get status counts
GET /api/clinics/map/status-counts

# Register new clinic (with coordinates)
POST /api/clinics
{
  "name": "My Clinic",
  "address": "123 Main St",
  "barangay": "Poblacion",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "veterinarian": "Dr. Smith",
  "licenseNumber": "VET-123",
  "phone": "02-555-0100",
  "email": "clinic@example.com",
  "status": "Pending"
}

# Update clinic (including coordinates)
PUT /api/clinics/:id
{
  "latitude": 14.5995,
  "longitude": 120.9842,
  ...
}
```

---

## 📋 Quick Troubleshooting

**Q: Map not showing?**

- Ensure browser location permissions are allowed
- Check browser console for errors
- Verify API endpoint returns clinics: `http://localhost:3000/api/clinics/locations`

**Q: No markers on map?**

- Only clinics with both latitude AND longitude are shown
- Go to ClinicList → Edit existing clinic → Pin Location
- Or register new clinic with coordinates

**Q: Pin Location modal not opening?**

- Check browser console for errors
- Verify Leaflet CSS/images are loaded (no tracking prevention blocks)
- Try refreshing the page

**Q: Coordinates not saving?**

- Confirm form submission completed
- Check browser network tab for POST success
- Refresh page to verify saved

---

## 🎯 Next Steps (Optional Enhancements)

- Add clinic photo/logo upload
- Add inspection history timeline
- Add alert notifications for permit expiry
- Add route calculation from user location
- Export clinic list to PDF/CSV
- Add clinic statistics dashboard

---

**Status**: ✅ **COMPLETE & TESTED**

- Backend: ✅ API working, sample data loaded
- Frontend: ✅ Map rendering, filters working, sidebar synced
- Database: ✅ 5 sample clinics with coordinates
