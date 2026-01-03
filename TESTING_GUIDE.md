# Quick Testing Guide - Fixed Endpoints

## 🚀 Start the System

### 1. Start Backend Server
```powershell
cd Backend-Node
npm start
```
**Expected Output:**
```
🚀 CityVetCare API Server
📡 Server running on port 3000
🌍 Environment: development
🔗 API URL: http://localhost:3000
```

### 2. Start Web Frontend
```powershell
cd Frontend/web
npm run dev
```
**Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

---

## ✅ Test Scenarios

### Test 1: Approve Pending Report
**Page:** Pending Verification

**Steps:**
1. Navigate to: `http://localhost:5173/` and login
2. Go to: **Report Management** → **Pending Verification**
3. Find a pending report
4. Click the **green checkmark** (✅ Verify) button
5. Confirm the action

**Expected Result:**
- ✅ Alert: "Report #X has been approved successfully!"
- ✅ Report disappears from Pending Verification
- ✅ Report appears in All Incident Reports with status "Verified"
- ✅ Network tab shows: `PUT http://localhost:3000/api/incidents/X`
- ✅ Response: `200 OK`

**If it fails:**
- Check backend console for errors
- Check browser DevTools Console for errors
- Verify backend is running on port 3000

---

### Test 2: Reject Pending Report
**Page:** Pending Verification

**Steps:**
1. Go to: **Pending Verification**
2. Find a pending report
3. Click the **red X** (❌ Reject) button
4. Enter rejection reason
5. Confirm

**Expected Result:**
- ✅ Alert: "Report #X has been rejected"
- ✅ Report disappears from Pending Verification
- ✅ Report appears in Report History with status "Rejected"
- ✅ Network tab shows: `PUT http://localhost:3000/api/incidents/X`
- ✅ Response: `200 OK`

---

### Test 3: Update Incident Status
**Page:** All Incident Reports

**Steps:**
1. Go to: **Report Management** → **All Incident Reports**
2. Click on any report to view details
3. Click **"Change Status"** button
4. Select a new status (e.g., "In Progress")
5. Confirm

**Expected Result:**
- ✅ Alert: "Status updated to In Progress successfully!"
- ✅ Table refreshes with new status
- ✅ Status badge updates
- ✅ Network tab shows: `PUT http://localhost:3000/api/incidents/X`
- ✅ Response: `200 OK`

---

### Test 4: Create Patrol Schedule
**Page:** Catcher Schedule

**Steps:**
1. Go to: **Report Management** → **Catcher Schedule**
2. Click **"Create New Schedule"** button
3. Fill in the form:
   - Select incident
   - Select patrol staff
   - Choose date and time
   - Add notes (optional)
4. Click **"Create Schedule"**

**Expected Result:**
- ✅ Success message: "Patrol schedule created successfully!"
- ✅ Schedule appears in the list
- ✅ Incident status becomes "Verified"
- ✅ Network tab shows:
  - `POST http://localhost:3000/api/patrol-schedules` (200 OK)
  - `PUT http://localhost:3000/api/incidents/X` (200 OK)

---

### Test 5: Delete Incident
**Page:** All Incident Reports

**Steps:**
1. Go to: **All Incident Reports**
2. Click on a report to view details
3. Click **"Delete"** button
4. Confirm deletion

**Expected Result:**
- ✅ Report disappears from list
- ✅ Network tab shows: `DELETE http://localhost:3000/api/incidents/X`
- ✅ Response: `200 OK`

---

## 🔍 Browser DevTools Verification

### Open DevTools:
Press **F12** or **Ctrl+Shift+I**

### Network Tab Check:
**Before the fix (WRONG):**
```
PUT http://localhost:3000/api/incidents
Body: { id: 1, title: "...", status: "approved" }
Status: 404 Not Found ❌
```

**After the fix (CORRECT):**
```
PUT http://localhost:3000/api/incidents/1
Body: { title: "...", status: "verified" }
Status: 200 OK ✅
```

### Console Tab Check:
Look for these logs:
```
✅ API Request: PUT /incidents/1
✅ API Response: /incidents/1 200
✅ Response Data: { message: "Incident updated successfully", id: 1 }
```

**If you see errors:**
```
❌ API ERROR
URL: /incidents
Status Code: 404
Error Message: Endpoint not found
```
→ This means the fix wasn't applied correctly

---

## 🧪 Command-Line API Test

### Test GET endpoint:
```powershell
curl http://localhost:3000/api/incidents
```

### Test GET by ID:
```powershell
curl http://localhost:3000/api/incidents/1
```

### Test UPDATE:
```powershell
curl -X PUT http://localhost:3000/api/incidents/1 `
  -H "Content-Type: application/json" `
  -d '{"title":"Test","description":"Test","location":"Test","status":"verified","priority":"medium"}'
```

**Expected Response:**
```json
{
  "message": "Incident updated successfully",
  "id": 1
}
```

---

## 📊 Status Value Verification

### Valid Status Values for Incidents:
- ✅ `pending`
- ✅ `verified`
- ✅ `in_progress`
- ✅ `resolved`
- ✅ `rejected`
- ✅ `cancelled`

### Invalid Status Values (Will cause errors):
- ❌ `approved` → Use `verified` instead
- ❌ `scheduled` → Use `verified` instead (scheduled is for patrol_schedules)
- ❌ `completed` → Use `resolved` instead

---

## 🐛 Common Issues & Solutions

### Issue 1: "Endpoint not found" (404)
**Symptom:** PUT request fails with 404
**Solution:** Make sure you updated `Frontend/web/src/utils/api.js`
**Check:** URL should be `/incidents/${id}` not `/incidents?id=${id}`

### Issue 2: "Unknown column 'approved'" (Database error)
**Symptom:** Update fails with SQL error
**Solution:** Make sure you changed `status: 'approved'` to `status: 'verified'`
**File:** `PendingVerification.jsx` line 157

### Issue 3: "Cannot update incident status to scheduled"
**Symptom:** Creating patrol schedule fails
**Solution:** Use `status: 'verified'` instead of `status: 'scheduled'`
**File:** `CatcherSchedule.jsx` line 134

### Issue 4: Backend not responding
**Symptom:** Network error, cannot connect
**Solution:**
1. Check if backend is running: `http://localhost:3000`
2. Check if MySQL is running
3. Check backend console for errors

### Issue 5: CORS error
**Symptom:** "Access-Control-Allow-Origin" error
**Solution:** Backend CORS is set for `http://localhost:5173`
**Check:** Make sure frontend is running on port 5173

---

## 📱 Mobile App Testing (If Applicable)

If you also need to test the mobile app:

1. Check if mobile app uses the same API endpoints
2. Update `Frontend/mobile/config/api.js` with same fixes
3. Test report submission from mobile
4. Verify data syncs with web admin

---

## ✅ Success Checklist

After testing, you should be able to:

- ✅ Approve pending reports
- ✅ Reject pending reports
- ✅ Update incident status
- ✅ Create patrol schedules
- ✅ View incident details
- ✅ Delete incidents
- ✅ Update catcher teams
- ✅ Manage patrol staff
- ✅ View dashboard statistics

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs:**
   - Backend console: Shows API requests and database queries
   - Browser console: Shows frontend errors and API responses

2. **Verify the fixes:**
   - [API_FIXES_SUMMARY.md](API_FIXES_SUMMARY.md) - Complete list of changes
   - [STATUS_VALUES_REFERENCE.md](STATUS_VALUES_REFERENCE.md) - Valid status values

3. **Test the endpoints:**
   - Run [test-endpoints.js](test-endpoints.js) in browser console
   - Check Network tab in DevTools

---

**All systems should now be working! 🎉**

**Date:** January 3, 2026  
**Status:** ✅ All endpoint issues resolved
