# AllIncidentReport Component Architecture

## Component Hierarchy

```
AllIncidentReport (Main Component)
│
├─── Header Component
│    └─── User info, toggle drawer
│
├─── Drawer Component
│    └─── Navigation menu
│
├─── Quick Stats Dashboard
│    ├─── All Reports Count
│    ├─── Pending Count
│    ├─── In Progress Count
│    ├─── Verified Count
│    └─── Resolved Count
│
├─── Search & Filter Section
│    ├─── Search Input (real-time)
│    ├─── Status Filter Dropdown
│    ├─── Type Filter Dropdown
│    └─── Sort Options (date, priority, status, type)
│
├─── Reports Table
│    ├─── Table Headers
│    │    ├─── ID
│    │    ├─── Reporter
│    │    ├─── Type & Animal
│    │    ├─── Location
│    │    ├─── Date/Time
│    │    ├─── Priority
│    │    ├─── Status
│    │    └─── Actions
│    │
│    └─── Table Rows (filtered & sorted)
│         ├─── View Details Button (Eye Icon)
│         └─── Assign Team Button (User Icon)
│
├─── Report Details Modal (when viewing)
│    ├─── Basic Information
│    │    ├─── Reporter Name & Contact
│    │    ├─── Date & Time
│    │    └─── Location
│    │
│    ├─── Incident Details
│    │    ├─── Status Badge
│    │    ├─── Priority Badge
│    │    ├─── Animal Information
│    │    ├─── Assigned Team
│    │    └─── Follow-up Status
│    │
│    ├─── Description Section
│    ├─── Injuries Section (if any)
│    │
│    └─── Action Buttons
│         ├─── Update Status
│         ├─── Assign Team
│         └─── Add Note
│
└─── New Report Modal
     ├─── Incident Information
     │    ├─── Type Select
     │    ├─── Location Input
     │    ├─── Animal Type Select
     │    ├─── Animal Count Input
     │    └─── Severity Select
     │
     ├─── Reporter Information
     │    ├─── Name Input
     │    ├─── Contact Input
     │    ├─── Address Textarea
     │    └─── Injuries Textarea
     │
     ├─── Details Textarea
     ├─── Follow-up Checkbox
     │
     └─── Action Buttons
          ├─── Submit
          └─── Cancel
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Interaction                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              AllIncidentReport Component                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  State Management                               │   │
│  │  • reports (array)                              │   │
│  │  • searchTerm (string)                          │   │
│  │  • statusFilter (string)                        │   │
│  │  • typeFilter (string)                          │   │
│  │  • sortBy (string)                              │   │
│  │  • sortOrder (string)                           │   │
│  │  • selectedReport (object)                      │   │
│  │  • loading (boolean)                            │   │
│  │  • error (string)                               │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   API Service Layer                      │
│                    (utils/api.js)                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • apiService.incidents.getAll()                │   │
│  │  • apiService.incidents.getById(id)             │   │
│  │  • apiService.incidents.create(data)            │   │
│  │  • apiService.incidents.update(id, data)        │   │
│  │  • apiService.incidents.delete(id)              │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API Routes                      │
│              (Backend/routes/incidents.php)              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GET    /incidents.php          → Read all      │   │
│  │  GET    /incidents.php?id=1     → Read one      │   │
│  │  POST   /incidents.php          → Create        │   │
│  │  PUT    /incidents.php          → Update        │   │
│  │  DELETE /incidents.php          → Delete        │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   Incident Model                         │
│               (Backend/models/Incident.php)              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • read($filters)                               │   │
│  │  • readOne()                                    │   │
│  │  • create()                                     │   │
│  │  • update()                                     │   │
│  │  • delete()                                     │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    MySQL Database                        │
│                  (cityvetcare_db)                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Table: incidents                               │   │
│  │  • id, title, description                       │   │
│  │  • location, latitude, longitude                │   │
│  │  • status, priority                             │   │
│  │  • reporter_name, reporter_contact              │   │
│  │  • incident_date, images                        │   │
│  │  • assigned_catcher_id                          │   │
│  │  • created_at, updated_at                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Action
    │
    ├─── Search Input Changed
    │    └─→ setSearchTerm() → Filter Logic → Re-render Table
    │
    ├─── Filter Changed
    │    └─→ setStatusFilter() / setTypeFilter() → Filter Logic → Re-render Table
    │
    ├─── Sort Changed
    │    └─→ setSortBy() / setSortOrder() → Sort Logic → Re-render Table
    │
    ├─── View Details Clicked
    │    └─→ setSelectedReport(report) → Open Modal
    │
    ├─── New Report Clicked
    │    └─→ setIsNewReportModalOpen(true) → Open Modal
    │
    └─── Submit New Report
         └─→ handleNewReportSubmit() → API Call → Refresh Data
```

## Utility Integration

```
AllIncidentReport Component
    │
    ├─── uses constants.js
    │    • INCIDENT_STATUS
    │    • INCIDENT_PRIORITY
    │    • STATUS_COLORS
    │    • PRIORITY_COLORS
    │
    ├─── uses dateUtils.js
    │    • formatDate()
    │    • formatTime()
    │    • getCurrentDate()
    │
    ├─── uses validation.js (in NewReportModal)
    │    • isValidPhoneNumber()
    │    • isRequired()
    │    • validateForm()
    │
    └─── uses api.js
         • apiService.incidents.*
```

## API Request/Response Flow

### GET All Incidents
```
Request:
GET http://localhost/CityVetCare/Backend/routes/incidents.php

Response:
{
  "records": [
    {
      "id": 1,
      "title": "Bite Incident",
      "description": "Dog bite near market",
      "location": "Purok 4, Barangay San Juan",
      "status": "pending",
      "priority": "high",
      "reporter_name": "John Doe",
      "reporter_contact": "09123456789",
      "incident_date": "2025-11-26 14:30:00",
      "catcher_team_name": null,
      "created_at": "2025-11-26 14:30:00",
      "updated_at": "2025-11-26 14:30:00"
    }
  ],
  "total": 1
}
```

### POST Create Incident
```
Request:
POST http://localhost/CityVetCare/Backend/routes/incidents.php
Content-Type: application/json

{
  "title": "Bite Incident",
  "description": "Dog bite incident",
  "location": "Purok 4, Barangay San Juan",
  "status": "pending",
  "priority": "high",
  "reporter_name": "John Doe",
  "reporter_contact": "09123456789",
  "incident_date": "2025-11-26 14:30:00"
}

Response:
{
  "message": "Incident created successfully",
  "id": 5
}
```

## Filter & Sort Logic

```javascript
// Filter Logic
filteredReports = reports
  .filter(report => {
    // Search match
    const matchesSearch = 
      report.type.includes(searchTerm) ||
      report.reporter.includes(searchTerm) ||
      report.address.includes(searchTerm) ||
      report.animalType.includes(searchTerm);
    
    // Status match
    const matchesStatus = 
      statusFilter === "all" || 
      report.status === statusFilter;
    
    // Type match
    const matchesType = 
      typeFilter === "all" || 
      report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  })

// Sort Logic
  .sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case "date":
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case "priority":
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case "status":
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
        break;
    }
    
    return sortOrder === "desc" 
      ? (aValue < bValue ? 1 : -1)
      : (aValue > bValue ? 1 : -1);
  });
```

## Component Lifecycle

```
Component Mount
    │
    ├─→ useEffect() triggered
    │   └─→ fetchReports()
    │       ├─→ setLoading(true)
    │       ├─→ API call to get all incidents
    │       ├─→ Transform data
    │       ├─→ setReports(transformedData)
    │       ├─→ setLoading(false)
    │       └─→ On error: setError() + loadSampleData()
    │
    ├─→ Render loading state
    │
    ├─→ Render with data
    │   ├─→ Quick Stats
    │   ├─→ Search & Filters
    │   └─→ Reports Table
    │
    └─→ User interactions update state
        └─→ Re-render with new filtered/sorted data
```

## Error Handling Flow

```
API Call
    │
    ├─── Success
    │    └─→ Update state with data
    │
    └─── Error
         ├─→ Log error to console
         ├─→ Set error message
         ├─→ Load sample data (fallback)
         └─→ Display warning to user
```

## Styling Architecture

```
Tailwind CSS Classes Used:

Layout:
• min-h-screen bg-[#E8E8E8]
• p-8 space-y-6
• grid grid-cols-2 md:grid-cols-5 gap-4

Components:
• bg-white rounded-lg shadow-sm border border-gray-200
• px-6 py-4 hover:bg-gray-50

Colors:
• Primary: bg-[#FA8630] text-white
• Hover: hover:bg-[#E87928]
• Status badges: bg-{color}-100 text-{color}-800

Icons:
• @heroicons/react/24/outline
• h-5 w-5 (standard icon size)
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Reusable utilities
- ✅ Type-safe data flow
- ✅ Error resilience
- ✅ Maintainable code structure
