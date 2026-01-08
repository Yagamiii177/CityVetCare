# Incident Notification System - Quick Reference

## 🚀 Quick Start

### For Pet Owners (Mobile App)

1. **Submit a Report** (while logged in)
   - You'll receive an immediate notification: "Incident Report Submitted"

2. **View Notifications**
   - Tap the Notifications icon in bottom navigation
   - Unread notifications have a blue left border
   - Unread count shows on the navigation badge

3. **Check Report Status**
   - Tap any incident notification
   - You'll be taken directly to your report details
   - See full incident timeline and status

4. **Status Updates You'll Receive**
   - ✅ Submission confirmed
   - ✅ Report verified
   - ✅ Patrol in progress
   - ✅ Report resolved
   - ⚠️ Report rejected (with reason)

---

## 🔧 For Developers

### Backend: Create Notification Manually

```javascript
import { createIncidentNotification } from '../services/notificationService.js';

await createIncidentNotification({
  ownerId: 123,
  incidentId: 456,
  title: "Custom Title",
  message: "Custom message here",
  type: "submission" // or "status_update", "rejection"
});
```

### Backend: Notification Types

| Type | Use Case |
|------|----------|
| `submission` | Incident submitted |
| `status_update` | Status changed (Verified, In Progress, Resolved) |
| `rejection` | Report rejected |

### Frontend: Navigate to Incident from Notification

```javascript
navigation.navigate('MyReports', {
  highlightIncidentId: incidentId
});
```

### API Endpoints

```javascript
// Get all notifications
GET /api/notifications
Headers: Authorization: Bearer <token>

// Get unread count
GET /api/notifications/unread-count
Headers: Authorization: Bearer <token>

// Mark as read
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>

// Mark all as read
PUT /api/notifications/read-all
Headers: Authorization: Bearer <token>

// Delete notification
DELETE /api/notifications/:id
Headers: Authorization: Bearer <token>
```

---

## 🧪 Testing

### Run Complete Test Suite

```bash
node test-notification-system.js
```

### Manual Test Flow

1. Start backend: `cd Backend-Node && npm start`
2. Open mobile app
3. Login as pet owner
4. Submit incident report
5. Check notifications tab → Should see "Incident Report Submitted"
6. Admin updates status → New notification appears
7. Tap notification → Opens incident detail

---

## 🐛 Troubleshooting

### "Notifications not appearing"

**Check:**
1. User is logged in as `pet_owner`
2. Backend server is running
3. Database connection is working
4. Check backend logs for notification creation

### "Notification created but not showing in app"

**Check:**
1. Mobile app is authenticated (valid JWT token)
2. Notification API returns data: `/api/notifications`
3. User ID matches between incident and auth token
4. Refresh the notification list (pull down)

### "Navigation not working from notification"

**Check:**
1. `incident_id` is present in notification object
2. Navigation parameter name matches: `highlightIncidentId`
3. `MyReports` screen is registered in navigation
4. Check console for navigation errors

---

## 📊 Database Queries

### Check Notifications for Owner

```sql
SELECT * FROM notifications 
WHERE owner_id = 123 
ORDER BY created_at DESC;
```

### Check Unread Notifications

```sql
SELECT COUNT(*) as unread 
FROM notifications 
WHERE owner_id = 123 AND is_read = 0;
```

### Get Notifications with Incident Details

```sql
SELECT 
  n.notification_id,
  n.title,
  n.message,
  n.type,
  n.is_read,
  n.created_at,
  i.status as incident_status,
  i.report_type
FROM notifications n
LEFT JOIN incident_report i ON n.incident_id = i.report_id
WHERE n.owner_id = 123
ORDER BY n.created_at DESC;
```

---

## 📝 Code Snippets

### Backend: Add Notification on Custom Event

```javascript
// In any route or service
import { createIncidentNotification } from '../services/notificationService.js';

// Example: Notify when patrol is assigned
const incident = await Incident.getById(incidentId);

if (incident.owner_id) {
  await createIncidentNotification({
    ownerId: incident.owner_id,
    incidentId: incidentId,
    title: "Patrol Team Assigned",
    message: `Catcher ${catcherName} has been assigned to your report.`,
    type: "status_update"
  });
}
```

### Frontend: Handle Notification Tap

```javascript
const handleNotificationTap = async (notification) => {
  // Mark as read
  await api.notifications.markRead(notification.id);
  
  // Navigate based on type
  if (notification.incident_id) {
    navigation.navigate('MyReports', {
      highlightIncidentId: notification.incident_id
    });
  }
};
```

### Frontend: Fetch and Display Notifications

```javascript
const [notifications, setNotifications] = useState([]);

const fetchNotifications = async () => {
  try {
    const response = await api.notifications.getAll();
    setNotifications(response.notifications || []);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

useEffect(() => {
  fetchNotifications();
  
  // Poll every 10 seconds
  const interval = setInterval(fetchNotifications, 10000);
  return () => clearInterval(interval);
}, []);
```

---

## 🎯 Common Use Cases

### Use Case 1: Notify on Report Submission

**Trigger:** POST `/api/incidents` (authenticated)  
**Automatic:** Yes  
**Type:** `submission`  
**Title:** "Incident Report Submitted"  
**Message:** "Your incident report was submitted successfully. Please wait while it is being verified."

### Use Case 2: Notify on Status Change

**Trigger:** PUT `/api/incidents/:id` with `status` field  
**Automatic:** Yes (if incident has owner_id)  
**Type:** `status_update` or `rejection`  
**Title:** Varies by status  
**Message:** Varies by status

### Use Case 3: Manual Notification

**When to use:** Custom business logic, scheduled tasks, external triggers

```javascript
// Example: Scheduled reminder
const sendReminder = async () => {
  const incidents = await getOpenIncidents();
  
  for (const incident of incidents) {
    if (incident.owner_id) {
      await createIncidentNotification({
        ownerId: incident.owner_id,
        incidentId: incident.id,
        title: "Follow-up Required",
        message: "Your incident report requires additional information.",
        type: "status_update"
      });
    }
  }
};
```

---

## 🔐 Security Notes

- ✅ Notifications scoped to authenticated users
- ✅ JWT token required for all notification endpoints
- ✅ User can only see their own notifications
- ✅ owner_id always set from req.user (no spoofing)
- ✅ Anonymous reports do NOT generate notifications

---

## 📦 Dependencies

### Backend
- `mysql2` - Database driver
- `jsonwebtoken` - Authentication
- Express middleware: `authenticateToken`, `optionalAuth`

### Frontend
- `@react-navigation/native` - Navigation
- `react-native-gesture-handler` - Swipe gestures
- `@expo/vector-icons` - Icons
- AsyncStorage - Token storage

---

## 📈 Performance Tips

1. **Database Indexes** - Already created on `owner_id`, `incident_id`, `is_read`
2. **Polling Interval** - Default 10 seconds (adjustable in NotificationScreen.js)
3. **Query Optimization** - Use LEFT JOIN for incident details
4. **Pagination** - Not implemented yet (add if notification volume grows)

---

## 🎨 Customization

### Change Notification Polling Interval

**File:** `Frontend/mobile/screens/Main/NotificationScreen.js`

```javascript
// Change from 10 seconds to 30 seconds
const interval = setInterval(fetchNotifications, 30000);
```

### Add New Notification Type

1. **Backend:** Add type to notification service
```javascript
// notificationService.js
export async function notifyCustomEvent({ ownerId, incidentId }) {
  return await createIncidentNotification({
    ownerId,
    incidentId,
    title: "Custom Event",
    message: "Custom message here",
    type: "custom_type"
  });
}
```

2. **Frontend:** Add icon mapping
```javascript
// NotificationScreen.js
const getIconForType = (type) => {
  switch (type) {
    case "custom_type":
      return require("../../assets/icons/custom_icon.png");
    // ... other cases
  }
};
```

### Customize Notification Messages

**File:** `Backend-Node/services/notificationService.js`

```javascript
// Change messages in notifyIncidentStatusChange()
case "Resolved":
  title = "Great News!";
  message = "Your incident has been successfully resolved by our team.";
  type = "status_update";
  break;
```

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| No notifications showing | Check authentication, backend logs, database connection |
| Notifications not updating | Check polling interval, API endpoint, token validity |
| Navigation not working | Verify route names, params, screen registration |
| Duplicate notifications | Check status change detection logic |
| Missing rejection reason | Ensure `rejection_reason` passed in status update |

---

**Last Updated:** January 8, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
