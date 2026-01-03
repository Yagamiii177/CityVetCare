# Status Values Reference Guide

## Valid Status Values by Table

### 📋 Incidents Table
**Database Column:** `status ENUM('pending', 'verified', 'in_progress', 'resolved', 'rejected', 'cancelled')`

| Status | Description | Used In |
|--------|-------------|---------|
| `pending` | Newly submitted, awaiting verification | ReportIncident submission |
| `verified` | Approved by admin, ready for patrol | Pending Verification ✅ Approve |
| `in_progress` | Actively being handled | Patrol status updates |
| `resolved` | Successfully completed | Admin marks as resolved |
| `rejected` | Not valid or cannot be handled | Pending Verification ❌ Reject |
| `cancelled` | Cancelled by reporter or admin | Manual cancellation |

### 📅 Patrol Schedules Table  
**Database Column:** `status ENUM('scheduled', 'in_progress', 'completed', 'cancelled')`

| Status | Description | Used In |
|--------|-------------|---------|
| `scheduled` | Patrol scheduled, not started | CatcherSchedule creation |
| `in_progress` | Patrol team is currently working | Catcher updates status |
| `completed` | Patrol completed successfully | Catcher marks complete |
| `cancelled` | Patrol cancelled | Manual cancellation |

### 👥 Catcher Teams Table
**Database Column:** `status ENUM('active', 'inactive', 'on_leave')`

| Status | Description | Used In |
|--------|-------------|---------|
| `active` | Available for assignments | Team management |
| `inactive` | Not available | Team management |
| `on_leave` | Temporarily unavailable | Team management |

---

## Status Flow Diagrams

### Incident Status Flow:
```
┌─────────────┐
│   pending   │ ◄─── Report submitted
└──────┬──────┘
       │
       ├─── Approve ───► ┌──────────┐
       │                 │ verified │
       │                 └────┬─────┘
       │                      │
       │                      └─── Schedule patrol ───► ┌──────────────┐
       │                                                 │ in_progress  │
       │                                                 └──────┬───────┘
       │                                                        │
       │                                                        └─► ┌──────────┐
       │                                                             │ resolved │
       │                                                             └──────────┘
       │
       └─── Reject ───► ┌──────────┐
                        │ rejected │
                        └──────────┘
```

### Patrol Schedule Status Flow:
```
┌───────────┐
│ scheduled │ ◄─── Schedule created
└─────┬─────┘
      │
      └─── Start ───► ┌──────────────┐
                      │ in_progress  │
                      └──────┬───────┘
                             │
                             ├─── Complete ───► ┌───────────┐
                             │                   │ completed │
                             │                   └───────────┘
                             │
                             └─── Cancel ───► ┌───────────┐
                                               │ cancelled │
                                               └───────────┘
```

---

## Frontend Usage Examples

### Approve Report (Pending Verification):
```javascript
await apiService.incidents.update(id, {
  ...incident,
  status: 'verified'  // ✅ Correct
});
```

### Reject Report (Pending Verification):
```javascript
await apiService.incidents.update(id, {
  ...incident,
  status: 'rejected'  // ✅ Correct
});
```

### Create Patrol Schedule:
```javascript
// Create schedule with 'scheduled' status
await apiService.patrolSchedules.create({
  ...scheduleData,
  status: 'scheduled'  // ✅ For patrol_schedules table
});

// Update incident to 'verified' (NOT 'scheduled')
await apiService.incidents.update(incidentId, {
  ...incident,
  status: 'verified'  // ✅ Correct for incidents table
});
```

### Start Patrol:
```javascript
await apiService.patrolSchedules.update(scheduleId, {
  ...schedule,
  status: 'in_progress'  // ✅ For patrol_schedules
});

await apiService.incidents.update(incidentId, {
  ...incident,
  status: 'in_progress'  // ✅ Also update incident
});
```

### Complete Patrol:
```javascript
await apiService.patrolSchedules.update(scheduleId, {
  ...schedule,
  status: 'completed'  // ✅ For patrol_schedules
});

await apiService.incidents.update(incidentId, {
  ...incident,
  status: 'resolved'  // ✅ Mark incident as resolved
});
```

---

## ❌ Common Mistakes to Avoid

### DON'T use these invalid statuses:

```javascript
// ❌ WRONG - 'approved' doesn't exist
status: 'approved'

// ❌ WRONG - 'scheduled' is only for patrol_schedules table, not incidents
await apiService.incidents.update(id, { status: 'scheduled' });

// ❌ WRONG - 'completed' is only for patrol_schedules, use 'resolved' for incidents
await apiService.incidents.update(id, { status: 'completed' });

// ❌ WRONG - Misspellings
status: 'panding'
status: 'verifyed'
status: 'in_progres'
```

---

## Priority Values (Incidents)

**Database Column:** `priority ENUM('low', 'medium', 'high', 'urgent')`

| Priority | Color | Usage |
|----------|-------|-------|
| `low` | Green | Non-urgent, can wait |
| `medium` | Yellow | Normal priority |
| `high` | Orange | Needs attention soon |
| `urgent` | Red | Immediate action required |

---

## Frontend Status Display Mapping

### Status Badges:
```javascript
const getStatusBadge = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return styles[status.toLowerCase().replace(' ', '_')];
};
```

---

## Database Schema Reference

### Incidents Table (Simplified):
```sql
CREATE TABLE incidents (
  id INT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  status ENUM('pending', 'verified', 'in_progress', 'resolved', 'rejected', 'cancelled'),
  priority ENUM('low', 'medium', 'high', 'urgent'),
  ...
);
```

### Patrol Schedules Table (Simplified):
```sql
CREATE TABLE patrol_schedules (
  id INT PRIMARY KEY,
  incident_id INT,
  schedule_date DATETIME,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
  ...
);
```

---

## Quick Reference Card

**When user submits report:**
```
Status: pending
```

**When admin approves:**
```
Incident: pending → verified
```

**When admin rejects:**
```
Incident: pending → rejected
```

**When patrol is scheduled:**
```
Incident: verified (unchanged)
Patrol Schedule: scheduled (new)
```

**When patrol starts:**
```
Incident: verified → in_progress
Patrol Schedule: scheduled → in_progress
```

**When patrol completes:**
```
Incident: in_progress → resolved
Patrol Schedule: in_progress → completed
```

---

**Last Updated:** January 3, 2026  
**Related Files:**
- [Database/schema.sql](Database/schema.sql)
- [Frontend/web/src/utils/api.js](Frontend/web/src/utils/api.js)
- [API_FIXES_SUMMARY.md](API_FIXES_SUMMARY.md)
