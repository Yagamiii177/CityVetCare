# Notification System Troubleshooting Guide

## 🔍 Quick Diagnostics

### Problem: Notifications Not Appearing in Mobile App

#### Step 1: Verify User Authentication
```bash
# Check if user is logged in
# In mobile app, check AsyncStorage

# Expected: Token should exist
# If not: User needs to log in
```

**Solution:** Ensure user is logged in as `pet_owner` type.

#### Step 2: Check Backend Server
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Expected: { status: "ok", ... }
# If not: Start backend server
cd Backend-Node
npm start
```

#### Step 3: Check Notification API
```bash
# Test notification endpoint (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notifications

# Expected: { success: true, notifications: [...] }
# If error: Check token validity and backend logs
```

#### Step 4: Verify Database Schema
```sql
-- Check if columns exist
DESCRIBE notifications;

-- Expected columns:
-- notification_id, user_id, user_type, owner_id, incident_id,
-- title, message, type, stray_animal_id, is_read, created_at

-- If missing: Run migration script
-- mysql -u root -p cityvetcare_db < Database/migrations/004_add_incident_notifications.sql
```

#### Step 5: Check Backend Logs
```bash
# Start backend with debug logging
cd Backend-Node
npm start

# Look for these log messages:
# "✅ Incident created successfully with ID: X"
# "✅ Submission notification sent to owner X"
# "✅ Status change notification sent to owner X"

# If you see "❌" or errors, check the error message
```

---

### Problem: Notification Created But Not Visible

#### Check 1: User ID Mismatch
```sql
-- Verify notification belongs to current user
SELECT 
  n.notification_id,
  n.owner_id,
  n.user_id,
  po.email
FROM notifications n
LEFT JOIN pet_owner po ON n.owner_id = po.owner_id
WHERE n.incident_id = <INCIDENT_ID>;

-- Expected: owner_id should match logged-in user's ID
```

**Solution:** Ensure `owner_id` is set correctly from `req.user.id`.

#### Check 2: Notification Endpoint Permissions
```javascript
// In backend logs, check:
// "User X requesting notifications"
// "Found Y notifications for user X"

// If 0 notifications found but they exist in DB,
// check user_id and user_type in query
```

#### Check 3: Mobile App Polling
```javascript
// In NotificationScreen.js
// Verify polling is active (should run every 10 seconds)

useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 10000);
  return () => clearInterval(interval);
}, []);
```

**Solution:** Pull down to manually refresh if polling stopped.

---

### Problem: Navigation Not Working from Notification

#### Check 1: Incident ID Present
```javascript
// In notification object, verify:
notification.incident_id  // Should be a number
notification.type         // Should be "submission", "status_update", or "rejection"

// If missing: Check backend notification creation
```

#### Check 2: Navigation Route
```javascript
// Verify route name is correct
navigation.navigate('MyReports', {
  highlightIncidentId: notification.incident_id
});

// Common mistake: Wrong screen name
// Should be: 'MyReports' (capital M, capital R)
// Not: 'myReports' or 'My Reports'
```

#### Check 3: Route Parameter Handling
```javascript
// In MyReportsScreen.js, verify:
const highlightIncidentId = route?.params?.highlightIncidentId;

// And the useFocusEffect is present
useFocusEffect(
  useCallback(() => {
    if (highlightIncidentId) {
      navigation.navigate('ReportDetail', { 
        reportId: highlightIncidentId 
      });
    }
  }, [highlightIncidentId])
);
```

---

### Problem: Rejection Reason Not Showing

#### Check 1: Backend Update Request
```javascript
// Verify rejection_reason is sent in PUT request
PUT /api/incidents/:id
Body: {
  status: "Rejected",
  rejection_reason: "Duplicate report"
}

// Check backend logs for:
// "Updating incident X with {status: 'Rejected', rejection_reason: '...'}"
```

#### Check 2: Notification Message
```sql
-- Check notification message in database
SELECT message FROM notifications 
WHERE incident_id = <ID> 
  AND type = 'rejection';

-- Expected: Message should include rejection_reason
-- "Your report was rejected. Reason: <actual reason>"
```

#### Check 3: Service Logic
```javascript
// In notificationService.js, verify:
case "Rejected":
  title = "Report Rejected";
  message = rejectionReason 
    ? `Your report was rejected. Reason: ${rejectionReason}`
    : "Your report was rejected. Tap to view details.";
  type = "rejection";
  break;
```

---

### Problem: Duplicate Notifications

#### Check 1: Multiple Status Updates
```sql
-- Check for duplicates
SELECT 
  incident_id,
  type,
  COUNT(*) as count
FROM notifications
WHERE incident_id = <ID>
GROUP BY incident_id, type
HAVING count > 1;

-- If duplicates exist: Check status update logic
```

**Root Cause:** Status updated multiple times in quick succession.

**Solution:** Add deduplication logic or debounce status updates.

#### Check 2: Polling Creating Duplicates
**Not applicable** - Polling only reads, never creates notifications.

---

### Problem: Notifications for Anonymous Reports

#### Check 1: Authentication Check
```javascript
// In incidents.js POST route, verify:
if (req.user && req.user.id && req.user.userType === 'pet_owner') {
  await notifyIncidentSubmitted({...});
}

// If anonymous report, req.user will be null
// Notification should NOT be created
```

#### Check 2: Owner ID Set
```sql
-- Check incident record
SELECT report_id, owner_id, reporter_id 
FROM incident_report 
WHERE report_id = <ID>;

-- If owner_id is NULL: Report is anonymous
-- If owner_id exists: Report is authenticated
```

**Expected Behavior:** 
- Authenticated: `owner_id` set → Notification created
- Anonymous: `owner_id` is NULL → No notification

---

### Problem: Unread Count Wrong

#### Check 1: Database Count
```sql
-- Manual count of unread notifications
SELECT COUNT(*) as unread
FROM notifications
WHERE owner_id = <USER_ID> 
  AND is_read = 0;

-- Compare with API response
```

#### Check 2: Mark as Read Not Working
```sql
-- Check if is_read updated
SELECT notification_id, is_read 
FROM notifications 
WHERE notification_id = <ID>;

-- Should be 1 after marking as read
-- If still 0: Check PUT request
```

#### Check 3: API Endpoint
```bash
# Test mark as read
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notifications/123/read

# Expected: { success: true }
```

---

## 🧪 Testing Checklist

### Manual Test Script

```bash
# 1. Start backend
cd Backend-Node
npm start

# 2. Open mobile app and login as pet owner

# 3. Submit incident report
# Expected: See "Incident Report Submitted" notification

# 4. In backend/database, update incident status
UPDATE incident_report 
SET status = 'Verified' 
WHERE report_id = <ID>;

# 5. Wait 10 seconds or pull to refresh
# Expected: See "Report Verified" notification

# 6. Tap notification
# Expected: Navigate to incident detail screen

# 7. Return to notifications, tap notification again
# Expected: Blue border should be gone (marked as read)
```

### Automated Test

```bash
# Run comprehensive test suite
node test-notification-system.js

# Expected: 10/10 tests pass
# If failures: Check logs for specific error messages
```

---

## 🔧 Common Fixes

### Fix 1: Reset Database Schema
```sql
-- If schema is corrupted, drop and recreate
DROP TABLE IF EXISTS notifications;

-- Then restart backend, it will auto-create table
-- Or run migration script manually
```

### Fix 2: Clear App Cache (Mobile)
```javascript
// In mobile app development
// Clear AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.clear();

// Then login again
```

### Fix 3: Restart Backend
```bash
# Simple but effective
# Ctrl+C to stop
cd Backend-Node
npm start
```

### Fix 4: Check Firewall/Network
```bash
# Test connectivity
curl http://localhost:3000/api/health

# If fails, check:
# - Backend running on correct port
# - Firewall not blocking
# - Mobile device on same network (for testing)
```

---

## 📊 Health Check Queries

### Backend Health
```sql
-- Check recent notifications
SELECT 
  n.notification_id,
  n.title,
  n.type,
  n.created_at,
  po.email as owner_email
FROM notifications n
JOIN pet_owner po ON n.owner_id = po.owner_id
ORDER BY n.created_at DESC
LIMIT 10;
```

### Incident Notification Coverage
```sql
-- Check which incidents have notifications
SELECT 
  ir.report_id,
  ir.owner_id,
  ir.status,
  COUNT(n.notification_id) as notification_count
FROM incident_report ir
LEFT JOIN notifications n ON ir.report_id = n.incident_id
WHERE ir.owner_id IS NOT NULL
GROUP BY ir.report_id
ORDER BY ir.reported_at DESC
LIMIT 20;

-- Expected: 1+ notifications per authenticated incident
```

### Orphaned Notifications
```sql
-- Check for notifications without valid incident
SELECT 
  n.notification_id,
  n.incident_id,
  n.title
FROM notifications n
LEFT JOIN incident_report ir ON n.incident_id = ir.report_id
WHERE n.incident_id IS NOT NULL 
  AND ir.report_id IS NULL;

-- Should return 0 rows
-- If > 0: Some incidents were deleted but notifications remain
```

---

## 🆘 Emergency Procedures

### Scenario 1: All Notifications Disappeared
1. Check database connection
2. Verify table exists: `SHOW TABLES LIKE 'notifications';`
3. Check table contents: `SELECT COUNT(*) FROM notifications;`
4. If empty: Data loss, check backups
5. If not empty: API/auth issue, check logs

### Scenario 2: Notifications Flooding Users
1. Check for infinite loops in status updates
2. Review recent admin actions
3. Temporarily disable notification creation:
   ```javascript
   // In notificationService.js
   // Comment out notification creation
   // return { success: true, notificationId: null };
   ```
4. Fix root cause
5. Re-enable notifications

### Scenario 3: Database Corruption
1. Backup current data: `mysqldump cityvetcare_db > backup.sql`
2. Drop corrupted table: `DROP TABLE notifications;`
3. Restart backend (auto-creates table)
4. Restore data from backup if possible

---

## 📞 Support Contacts

- **Backend Issues:** Check `Backend-Node/services/notificationService.js`
- **Frontend Issues:** Check `Frontend/mobile/screens/Main/NotificationScreen.js`
- **Database Issues:** Check `Database/migrations/004_add_incident_notifications.sql`
- **Test Issues:** Run `node test-notification-system.js` and review output

---

## 📝 Logging Best Practices

### Enable Debug Logging
```javascript
// In backend, set log level
// utils/logger.js
const logger = new Logger('NOTIFICATIONS', 'DEBUG');
```

### Check Specific Logs
```bash
# Filter backend logs
npm start 2>&1 | grep "NOTIFICATIONS"

# Look for:
# ✅ Success messages
# ❌ Error messages
# ⚠️ Warning messages
```

---

## ✅ Verification Commands

After troubleshooting, verify everything works:

```bash
# 1. Backend health
curl http://localhost:3000/api/health

# 2. Authentication
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/auth/me

# 3. Notifications list
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notifications

# 4. Unread count
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notifications/unread-count

# All should return success responses
```

---

**Last Updated:** January 8, 2026  
**System Version:** 1.0.0  
**Tested On:** Node.js v18+, MySQL 8+, React Native 0.72+
