# Clinic Map Feature - Documentation

## Overview

The Clinic Map feature provides a comprehensive geographic visualization and monitoring system for veterinary clinics registered with CityVetCare. It enables administrators to track clinic locations, monitor compliance, and manage clinic operations effectively.

## Architecture

### Frontend Components (Modular Structure)

Located in: `Frontend/web/src/components/ClinicRegistration/ClinicMap/`

#### Core Components

1. **MapView.jsx** - Main map container displaying clinic markers

   - Integrates Leaflet for interactive mapping
   - Handles loading and error states
   - Displays clinic markers with custom icons

2. **MapController.jsx** - Controls map view and navigation

   - Auto-zoom to selected clinic
   - Fit bounds to show all filtered clinics
   - Smooth transitions between views

3. **ClinicMarker.jsx** - Individual clinic map markers

   - Custom color-coded pins by status
   - Interactive popups with clinic details
   - Click handlers for clinic selection

4. **MapFilters.jsx** - Filter controls for clinic data

   - Search by name/address/barangay
   - Filter by barangay, service, status, inspection
   - Collapsible filter panel

5. **AlertPanel.jsx** - Monitoring alerts display

   - Expiring permits warnings
   - Inspection follow-ups
   - Expired accreditation alerts

6. **ClinicListSidebar.jsx** - Sidebar with clinic list

   - Synchronized with map selection
   - Shows monitoring information
   - Clickable clinic cards

7. **StatusBadges.jsx** - Status indicator components

   - Clinic status badges
   - Inspection status badges
   - Color-coded for quick identification

8. **MapIcons.jsx** - Custom map marker icons

   - Green: Active clinics
   - Yellow: Temporarily Closed
   - Red: Suspended/Inactive
   - Gray: Pending

9. **useClinicMap.js** - Custom React hook

   - Centralized state management
   - API integration
   - Filter logic
   - Alert generation

10. **index.js** - Component exports
    - Barrel exports for easier imports
    - Clean component interface

### Backend API

#### Clinic Routes (`/api/clinics`)

- `GET /api/clinics` - Get all clinics with optional filters
- `GET /api/clinics/:id` - Get specific clinic details
- `POST /api/clinics` - Create new clinic
- `PUT /api/clinics/:id` - Update clinic information
- `PATCH /api/clinics/:id/approve` - Approve pending clinic

#### Clinic Map Routes (`/api/clinic-map`)

- `GET /api/clinic-map/statistics` - Get clinic statistics
- `GET /api/clinic-map/alerts` - Get monitoring alerts
- `GET /api/clinic-map/barangays` - Get barangay list with counts
- `GET /api/clinic-map/services` - Get all available services
- `POST /api/clinic-map/track-view` - Track clinic views for analytics
- `GET /api/clinic-map/nearby` - Find clinics near coordinates

### Database Schema

#### Primary Table: `private_clinic`

```sql
- clinic_id (PK)
- clinic_name
- address, barangay
- latitude, longitude (for mapping)
- contact_number, email
- head_veterinarian, license_number
- services (JSON)
- operating_hours (JSON)
- status (Active, Pending, Inactive, Suspended, Temporarily Closed)
- permit_expiry_date
- accreditation_expiry_date
- last_inspection_date
- inspection_status (Passed, Pending, Needs Follow-up)
- inspection_notes
- last_activity_date
- date_created, date_updated
```

#### Supporting Tables

**clinic_map_view** - Track map usage analytics

```sql
- view_id (PK)
- clinic_id (FK)
- viewed_by (FK to administrator)
- view_type (map, list, detail)
- view_date
```

**clinic_location_history** - Track location changes

```sql
- history_id (PK)
- clinic_id (FK)
- old_latitude, old_longitude, new_latitude, new_longitude
- old_address, new_address
- old_barangay, new_barangay
- changed_by (FK to administrator)
- changed_at, reason
```

**clinic_inspection_report** - Detailed inspection records

```sql
- inspection_id (PK)
- clinic_id (FK)
- inspector_id (FK)
- inspection_date, inspection_type
- facilities_score, equipment_score, hygiene_score, etc.
- overall_score
- inspection_result, follow_up_required
- findings, recommendations, violations
- photos (JSON), documents (JSON)
```

**clinic_permit_renewal** - Permit renewal tracking

```sql
- renewal_id (PK)
- clinic_id (FK)
- permit_type (Business Permit, Veterinary License, Accreditation)
- previous_permit_number, previous_expiry_date
- new_permit_number, new_issue_date, new_expiry_date
- renewal_status, applied_date, processed_date
- documents (JSON)
```

**clinic_complaint** - Complaint management

```sql
- complaint_id (PK)
- clinic_id (FK)
- complainant_name, contact, email
- complaint_type, complaint_description
- status, priority
- assigned_to (FK to administrator)
- investigation_notes, resolution_notes
- evidence_files (JSON)
```

## Features

### 1. Interactive Map

- **Leaflet Integration**: OpenStreetMap tiles for accurate mapping
- **Custom Markers**: Color-coded pins based on clinic status
- **Popup Information**: Click markers to view clinic details
- **Auto-Navigation**: Map auto-adjusts to show selected/filtered clinics

### 2. Advanced Filtering

- **Search**: Free-text search across name, address, barangay
- **Barangay Filter**: Filter by specific barangay
- **Service Filter**: Filter by services offered (e.g., Vaccination, Surgery)
- **Status Filter**: Active, Temporarily Closed, Suspended, Inactive
- **Inspection Filter**: Passed, Pending, Needs Follow-up

### 3. Monitoring & Alerts

- **Permit Expiry**: Alerts for permits expiring within 30 days
- **Accreditation Expiry**: Warnings for expiring accreditation (60 days)
- **Inspection Follow-ups**: Track clinics needing re-inspection
- **Expired Documents**: Immediate alerts for expired permits/accreditation

### 4. Clinic Information Display

- **Basic Info**: Name, address, contact details
- **Operating Hours**: Business hours in structured format
- **Services**: List of services offered
- **Veterinarian**: Head veterinarian name and license
- **Status**: Current operational status
- **Monitoring Data**: Permit dates, inspection status, last activity

### 5. Clinic List Sidebar

- **Synchronized Selection**: Click clinic in list to select on map
- **Monitoring Info**: Quick view of expiry dates and inspection status
- **Visual Indicators**: Color-coded status badges
- **Scrollable**: Handles large number of clinics

## Installation & Setup

### 1. Database Setup

Run the database migration:

```bash
cd Backend-Node
node setup-clinic-map-db.js
```

This creates:

- All required tables
- Sample clinic data (3 clinics in Manila area)
- Necessary indexes for performance

### 2. Backend Setup

The clinic map routes are automatically loaded in `server.js`:

```javascript
import clinicMapRouter from "./routes/clinic-map.js";
app.use("/api/clinic-map", clinicMapRouter);
```

### 3. Frontend Setup

The refactored components are located in:

```
Frontend/web/src/components/ClinicRegistration/ClinicMap/
├── MapView.jsx
├── MapController.jsx
├── ClinicMarker.jsx
├── MapFilters.jsx
├── AlertPanel.jsx
├── ClinicListSidebar.jsx
├── StatusBadges.jsx
├── MapIcons.jsx
├── useClinicMap.js
└── index.js
```

Main page component:

```
Frontend/web/src/pages/ClinicRegistration/ClinicMap.jsx
```

### 4. Dependencies

Required npm packages (should already be installed):

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@heroicons/react": "^2.0.0"
}
```

CSS import (already in MapView.jsx):

```javascript
import "leaflet/dist/leaflet.css";
```

## Usage

### For Administrators

1. **View Clinic Map**

   - Navigate to Clinic Registration → Clinic Map
   - Map loads with all clinics that have coordinates

2. **Filter Clinics**

   - Use search bar for quick lookup
   - Click "Filters" to expand advanced filters
   - Select barangay, service, status, or inspection criteria

3. **Select Clinic**

   - Click marker on map OR
   - Click clinic card in sidebar
   - Map auto-zooms to selected clinic
   - Popup shows detailed information

4. **Monitor Compliance**

   - Check "Active Alerts" panel at top
   - Red badges: Critical (expired permits)
   - Yellow badges: Warning (expiring soon)
   - Blue badges: Info (inspection follow-up)

5. **Refresh Data**
   - Click "Refresh" button to reload clinic data
   - Updates map markers and alerts

### For Clinic Registration

Clinics must have the following for map display:

- **Latitude & Longitude**: Geographic coordinates
- **Address**: Complete street address
- **Barangay**: Barangay location
- **Status**: Must be set (defaults to Pending)

Clinics appear on map only when:

- Coordinates are provided (latitude AND longitude)
- Status is set (any status will show, with appropriate color)

## Customization

### Change Map Center

Edit `ClinicMap.jsx`:

```javascript
<MapView
  center={[YOUR_LAT, YOUR_LNG]} // Default: [14.5995, 120.9842] (Manila)
  zoom={12}
/>
```

### Change Pin Colors

Edit `MapIcons.jsx`:

```javascript
export const clinicIcons = {
  active: createCustomIcon("#10B981"), // Change to your color
  temporaryClosed: createCustomIcon("#F59E0B"),
  // ...
};
```

### Add New Filters

1. Add state in `useClinicMap.js`:

```javascript
const [newFilter, setNewFilter] = useState("all");
```

2. Add filter UI in `MapFilters.jsx`

3. Update filter logic in `useClinicMap.js`:

```javascript
const filteredClinics = clinics.filter((clinic) => {
  // Add your filter condition
  if (newFilter !== "all" && clinic.newField !== newFilter) {
    return false;
  }
  // ...
});
```

### Change Alert Thresholds

Edit `useClinicMap.js`:

```javascript
// Change from 30 days to 45 days
const thirtyDaysFromNow = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
```

## Troubleshooting

### Map Not Displaying

- Check browser console for errors
- Verify Leaflet CSS is imported
- Ensure clinics have valid coordinates

### Markers Not Showing

- Verify clinics have `latitude` and `longitude` in database
- Check that coordinates are valid numbers (not strings)
- Ensure clinic status is set

### Filters Not Working

- Check console for JavaScript errors
- Verify filter values match database values exactly
- Ensure `services` field is valid JSON array

### Alerts Not Showing

- Verify expiry dates are set in database
- Check date format (YYYY-MM-DD)
- Ensure `inspection_status` field has valid enum value

## API Examples

### Get Clinic Statistics

```javascript
fetch('/api/clinic-map/statistics')
  .then(res => res.json())
  .then(data => console.log(data));

// Response:
{
  "success": true,
  "data": {
    "total_clinics": 50,
    "active_clinics": 45,
    "mappable_clinics": 48,
    "expired_permits": 2,
    "expiring_permits": 5
  }
}
```

### Get Nearby Clinics

```javascript
fetch("/api/clinic-map/nearby?lat=14.5995&lng=120.9842&radius=5")
  .then((res) => res.json())
  .then((data) => console.log(data));

// Returns clinics within 5km of coordinates
```

### Track Clinic View

```javascript
fetch("/api/clinic-map/track-view", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    clinic_id: 1,
    view_type: "map",
    viewed_by: 1, // admin_id
  }),
});
```

## Future Enhancements

- [ ] Heat map layer showing clinic density
- [ ] Routing/directions to clinics
- [ ] Street view integration
- [ ] Mobile app version
- [ ] Real-time status updates
- [ ] Geofencing for inspection zones
- [ ] Export map as PDF/image
- [ ] Print-friendly clinic list
- [ ] Advanced analytics dashboard
- [ ] Clinic comparison tool

## Support

For issues or questions:

1. Check this documentation
2. Review browser console for errors
3. Check server logs in `logs/` directory
4. Verify database connection and data

## License

Part of CityVetCare Application - City Veterinary Office Management System
