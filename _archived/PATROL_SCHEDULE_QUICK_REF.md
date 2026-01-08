# PATROL SCHEDULE QUICK REFERENCE

## 🚀 QUICK START

### Start Backend Server
```powershell
cd Backend-Node
node server.js
```

### Start Frontend
```powershell
cd Frontend/web
npm run dev
```

### Run Tests
```powershell
node test-patrol-grouping-logic.js
```

---

## 🎯 KEY CONCEPT

**ONE PATROL = ONE RECORD + MULTIPLE STAFF**

**Example:**
- User selects: Carlos, Maria, Juan (3 staff)
- System creates: **1 patrol record** with `assigned_catcher_id = "1,2,3"`
- ❌ NOT: 3 separate patrol records

---

## 📊 DATABASE SCHEMA

```sql
patrol_schedule (
  schedule_id INT PRIMARY KEY,
  report_id INT,
  assigned_catcher_id VARCHAR(255),  -- "1,2,3" format
  schedule_date DATE,
  schedule_time TIME,
  status ENUM('Assigned', 'On Patrol', 'Completed', 'Cancelled'),
  notes TEXT
)
```

**Key Change:** `assigned_catcher_id` changed from `INT` to `VARCHAR(255)`

---

## 🔧 API ENDPOINTS

### Create Patrol
```http
POST /api/patrol-schedules
Content-Type: application/json

{
  "incident_id": 10,
  "assigned_staff_ids": "1,2,3",
  "assigned_staff_names": "Carlos Mendoza, Maria Santos, Juan Reyes",
  "schedule_date": "2026-01-15 10:00:00",
  "schedule_time": "10:00",
  "status": "scheduled",
  "notes": "Team patrol"
}
```

### Check Conflict
```http
POST /api/patrol-schedules/check-conflict
Content-Type: application/json

{
  "staffIds": ["1", "2", "3"],
  "scheduleDate": "2026-01-15",
  "scheduleTime": "10:00"
}
```

### Get All Patrols
```http
GET /api/patrol-schedules?status=scheduled
```

### Get Patrol by ID
```http
GET /api/patrol-schedules/21
```

---

## 🎨 UI COMPONENTS

### MultiSelectCheckbox
```jsx
import MultiSelectCheckbox from '../components/MultiSelectCheckbox';

<MultiSelectCheckbox
  options={staffList}          // Array of {id, name}
  selected={selectedStaff}     // Array of selected IDs
  onChange={setSelectedStaff}  // Update handler
  placeholder="Select patrol staff"
/>
```

**Features:**
- ✅ Click checkbox to toggle (no CTRL/CMD needed)
- ✅ Selected items shown as tags/pills
- ✅ "Clear All" button
- ✅ Click outside to close

---

## 🧪 TESTING CHECKLIST

Run `test-patrol-grouping-logic.js` to verify:

1. ✅ Backend connectivity
2. ✅ ONE patrol record created (not multiple)
3. ✅ All staff IDs stored together ("1,2,3")
4. ✅ Conflict detection works
5. ✅ Database integrity maintained

**Expected Output:**
```
✅ ALL TESTS PASSED - PATROL GROUPING LOGIC IS CORRECT
```

---

## 🐛 TROUBLESHOOTING

### "Only 1 staff instead of 3"
**Problem:** Database column is INT instead of VARCHAR  
**Solution:** Run migration
```powershell
node run-patrol-migration.js
```

### "Conflict not detected"
**Problem:** checkConflicts() not parsing comma-separated IDs  
**Solution:** Ensure PatrolSchedule.checkConflicts() splits staff IDs correctly

### "Multiple patrol records created"
**Problem:** create() method using loop instead of join  
**Solution:** Verify create() uses `staffArray.join(',')` not loop

---

## 📂 KEY FILES

### Backend
- `Backend-Node/models/PatrolSchedule.js` - Core logic
- `Backend-Node/routes/patrol-schedules.js` - API endpoints

### Frontend  
- `Frontend/web/src/components/MultiSelectCheckbox.jsx` - Multi-select UI
- `Frontend/web/src/pages/ReportManagement/CatcherSchedule.jsx` - Main page

### Database
- `Database/schema.sql` - Table definitions
- `Database/migrations/fix_patrol_schedule_multi_staff.sql` - Migration

### Tests
- `test-patrol-grouping-logic.js` - Validation suite
- `run-patrol-migration.js` - Migration runner

---

## 💡 USAGE EXAMPLE

### Create Team Patrol
```javascript
// Frontend code
const createPatrol = async () => {
  const patrolData = {
    incident_id: selectedIncident.id,
    assigned_staff_ids: selectedStaff.join(','),  // "1,2,3"
    assigned_staff_names: selectedStaff.map(id => 
      staffList.find(s => s.id == id)?.name
    ).join(', '),
    schedule_date: `${scheduleDate} ${scheduleTime}`,
    schedule_time: scheduleTime,
    status: 'scheduled',
    notes: notes
  };
  
  await apiService.createPatrolSchedule(patrolData);
};
```

### Display Patrol Team
```jsx
// Table display
<td>
  {patrol.assigned_staff_names}
  <span className="ml-2 badge">
    {patrol.staff_count} Members
  </span>
</td>
```

---

## ⚠️ IMPORTANT NOTES

1. **VARCHAR Limit:** 255 characters = ~50 staff IDs max
2. **No Foreign Key:** Cannot use FK with comma-separated values
3. **Validation:** Done in application layer, not database
4. **Conflict Window:** 2 hours before/after scheduled time
5. **Status Mapping:** Frontend uses lowercase, database uses capitalized ENUM

---

## 🎓 TECHNICAL DETAILS

### Status Conversion
```javascript
// Frontend → Database
'scheduled' → 'Assigned'
'in_progress' → 'On Patrol'
'completed' → 'Completed'

// Database → Frontend (reverse)
'Assigned' → 'scheduled'
'On Patrol' → 'in_progress'
'Completed' → 'completed'
```

### Conflict Detection Logic
1. Parse new patrol's staff IDs
2. Find existing patrols on same date
3. Parse existing patrol's staff IDs
4. Check for ANY overlap (`staffArray.some(id => existingIds.includes(id))`)
5. If overlap + within 2-hour window → CONFLICT

---

## 📞 SUPPORT

For issues or questions:
1. Check `PATROL_SCHEDULE_FIX_COMPLETE.md` for detailed documentation
2. Run automated tests: `node test-patrol-grouping-logic.js`
3. Verify database schema: Check `assigned_catcher_id` is VARCHAR(255)
4. Review backend logs for error details

---

**Last Updated:** January 7, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
