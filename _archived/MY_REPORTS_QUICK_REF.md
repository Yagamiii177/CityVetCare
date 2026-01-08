# My Reports - Quick Reference Guide

## 🚀 Quick Start

### For Pet Owners (Mobile App Users)
1. **Login** to the mobile app with your pet owner credentials
2. **Report Incident** using the form (fill all required fields)
3. **Submit Report** after selecting location on map
4. **Click History Icon** (⏱️) on top-right of Report screen
5. **View Your Reports** - Filter by status if needed
6. **Tap Report Card** to see full details

---

## 📱 Mobile Screens

### My Reports Screen
**Navigation:** Report Incident Screen → History Icon (top-right)

**Features:**
- View all your submitted reports
- Filter by: All, Pending, In Progress, Resolved, Rejected
- Pull down to refresh
- Color-coded status badges
- See assigned catchers
- Tap card to view details

### Report Detail Screen
**Navigation:** My Reports → Tap any report card

**Information Shown:**
- Current status (color-coded banner)
- Animal details (type, breed, color, size)
- Your incident description
- Location on map
- Assigned catcher(s) with contact
- Patrol schedule & status
- Resolution or rejection notes
- Evidence photos you uploaded
- Timeline of report

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | 🟡 Yellow | Awaiting review |
| Scheduled | 🔵 Blue | Patrol scheduled |
| In Progress | 🟠 Orange | Catcher on site |
| Resolved | 🟢 Green | Case closed |
| Rejected | 🔴 Red | Not actionable |
| Verified | 🟣 Purple | Admin verified |

---

## 🔧 Backend API

### Get Owner's Reports
```http
GET /api/incidents/owner/:ownerId
```

**Query Parameters:**
- `status` (optional) - Filter by status

**Example:**
```bash
# Get all reports for owner 1
curl http://localhost:5000/api/incidents/owner/1

# Get only pending reports
curl http://localhost:5000/api/incidents/owner/1?status=Pending
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "incident_type": "stray",
      "animal_type": "Dog",
      "status": "Pending",
      "location_address": "Manila Street",
      "assigned_catchers": "John Doe, Jane Smith",
      "patrol_status": "Assigned",
      "patrol_date": "2026-01-09",
      "patrol_time": "14:00:00",
      "created_at": "2026-01-08T10:30:00"
    }
  ],
  "total": 1
}
```

### Get Report Details
```http
GET /api/incidents/:reportId
```

---

## 🗄️ Database Schema

### incident_report Table
```sql
CREATE TABLE incident_report (
  report_id INT PRIMARY KEY,
  reporter_id INT,
  owner_id INT NULL,  -- ✨ NEW: Links to pet_owner
  location_id INT,
  report_type ENUM('bite', 'stray', 'lost'),
  description TEXT,
  status ENUM('Pending', 'Verified', 'Scheduled', 'In Progress', 'Resolved', 'Rejected'),
  incident_date DATETIME,
  reported_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES pet_owner(owner_id) ON DELETE SET NULL
);
```

**Important:**
- `owner_id` is nullable (supports anonymous reports)
- Foreign key ensures data integrity
- Index on `owner_id` for fast queries

---

## 💡 Usage Examples

### Check Reports in Database
```sql
-- View all reports with owners
SELECT r.report_id, r.status, r.incident_type, 
       po.full_name as owner_name
FROM incident_report r
LEFT JOIN pet_owner po ON r.owner_id = po.owner_id
WHERE r.owner_id IS NOT NULL;

-- Count reports per owner
SELECT owner_id, COUNT(*) as total_reports
FROM incident_report
WHERE owner_id IS NOT NULL
GROUP BY owner_id;
```

### Test API Endpoint
```javascript
// Using JavaScript (Node.js)
const axios = require('axios');

async function getMyReports(ownerId) {
  const response = await axios.get(
    `http://localhost:5000/api/incidents/owner/${ownerId}`
  );
  console.log(response.data);
}

getMyReports(1);
```

---

## 🔐 Authentication Notes

**Authenticated Reports:**
- Require login
- `owner_id` automatically set
- Visible in "My Reports"
- Can track status

**Anonymous Reports:**
- No login required (emergency mode)
- `owner_id` is NULL
- NOT visible in "My Reports"
- Stored separately

---

## 🐛 Troubleshooting

### "No reports found"
**Possible causes:**
1. You haven't submitted any reports while logged in
2. Reports were submitted anonymously (emergency mode)
3. Database connection issue

**Solution:**
- Submit a new report while authenticated
- Check backend logs for errors
- Verify owner_id in database

### Reports not showing details
**Possible causes:**
1. Network connectivity issue
2. Invalid report ID
3. Report deleted from database

**Solution:**
- Check internet connection
- Pull to refresh
- Verify report exists in database

### Backend error on /owner/:ownerId
**Possible causes:**
1. Invalid owner ID
2. Database connection lost
3. Missing foreign key

**Solution:**
```bash
# Check database connection
node -e "require('./Backend-Node/config/database.js')"

# Verify owner exists
mysql -u root cityvetcare_db -e "SELECT * FROM pet_owner WHERE owner_id = 1"

# Check foreign key
mysql -u root cityvetcare_db -e "SHOW CREATE TABLE incident_report"
```

---

## 📞 Need Help?

### Files to Check
1. **Backend Model:** `Backend-Node/models/Incident.js`
2. **Backend Routes:** `Backend-Node/routes/incidents.js`
3. **Mobile Service:** `Frontend/mobile/services/apiService.js`
4. **My Reports Screen:** `Frontend/mobile/screens/ReportManagement/MyReportsScreen.js`
5. **Report Detail:** `Frontend/mobile/screens/ReportManagement/ReportDetailScreen.js`

### Common Commands
```bash
# Start backend
cd Backend-Node
npm start

# Check database
mysql -u root cityvetcare_db

# View logs
tail -f Backend-Node/logs/app.log

# Test endpoint
curl http://localhost:5000/api/incidents/owner/1
```

---

## ✨ Feature Complete!

**Implementation Status: 100% ✅**

All requirements satisfied:
- Owner-based filtering ✅
- Patrol status display ✅
- Assigned catchers shown ✅
- Modern mobile UI ✅
- Read-only for owners ✅
- Backend data contract enforced ✅
