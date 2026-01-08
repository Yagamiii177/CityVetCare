# Patrol Schedule Management - Quick Start Guide

## 🚀 How to Use the Enhanced Features

### Starting the System

```bash
# 1. Start Backend Server
cd Backend-Node
node server.js

# 2. Start Frontend (separate terminal)
cd Frontend/web
npm run dev

# 3. Access the application
# Open browser: http://localhost:5173
```

---

## 📅 Creating a Patrol Schedule

### Step-by-Step Process:

1. **Navigate to Patrol Schedule page**
   - Click on "Patrol Schedule Management" in the sidebar
   
2. **Click "New Schedule" button**
   - Orange button in top-right corner

3. **Step 1: Select Patrol Staff** 
   - Click on the dropdown field
   - Click individual animal catchers to select them
   - ✓ Green checkboxes appear when selected
   - Selected staff appear as orange tags/pills
   - Click X on tags to remove individual selections
   - **NO** keyboard shortcuts needed!

4. **Step 2: Select Incident**
   - Choose a verified incident from the dropdown
   - Shows incident ID, title, and location

5. **Step 3: Set Date & Time**
   - **Date:** Click anywhere on the date field to open calendar
   - **Time:** Click anywhere on the time field to select time
   - The system will check for conflicts automatically

6. **Step 4: Add Notes (Optional)**
   - Add special instructions or safety notes
   - Optional field

7. **Submit**
   - Click "Create Patrol Schedule"
   - System validates and checks for conflicts
   - If conflicts detected, yellow warning appears
   - Fix conflicts by changing time or staff

---

## ⚠️ Conflict Detection

### What Triggers a Conflict?

A conflict occurs when:
- Same animal catcher is already scheduled
- Within 2 hours of another schedule
- On the same date

### Example Conflict Scenarios:

❌ **CONFLICT:**
- Carlos Mendoza scheduled at 10:00 AM
- Trying to schedule Carlos again at 11:00 AM (within 2 hours)

✅ **NO CONFLICT:**
- Carlos Mendoza scheduled at 10:00 AM
- Maria Santos scheduled at 10:00 AM (different staff, OK!)

✅ **NO CONFLICT:**
- Carlos Mendoza scheduled at 10:00 AM
- Carlos Mendoza scheduled at 1:00 PM (more than 2 hours apart)

### How to Resolve Conflicts:

1. **Option 1:** Change the time
   - Schedule at least 2 hours before/after existing schedule
   
2. **Option 2:** Select different staff
   - Remove conflicting staff member
   - Add available staff member

3. **Option 3:** Cancel existing schedule
   - Go to schedules table
   - Delete or complete the conflicting schedule first

---

## 📊 Managing Schedules

### View All Schedules

- Scroll to "Active Patrol Schedules" table
- Shows all current and past schedules

### Filter Schedules

- **Search:** Type incident details, staff names, or locations
- **Status Filter:** Choose from:
  - All Status
  - Scheduled
  - In Progress
  - Completed

### Update Schedule Status

**Scheduled → In Progress:**
- Click "Start" button in Actions column
- Updates patrol and incident status

**In Progress → Completed:**
- Click "Complete" button
- Marks patrol as finished
- Updates incident to "Resolved"

---

## 👥 Animal Catcher Data

### Available Animal Catchers (12 total):

1. Carlos Mendoza
2. Maria Santos
3. Juan Reyes
4. Anna Garcia
5. Roberto Cruz
6. Sofia Diaz
7. Miguel Torres
8. Elena Rodriguez
9. Diego Hernandez
10. Isabella Lopez
11. Fernando Gomez
12. Carmen Flores

All have unique contact numbers (+63 9XX XXX XXXX format)

---

## ✅ Form Validation

### Required Fields:
- ✓ Patrol Staff (at least 1 required)
- ✓ Approved Incident
- ✓ Schedule Date
- ✓ Schedule Time

### Optional Fields:
- Notes/Special Instructions

### Error Messages:

- **Red error banner:** Critical validation error or conflict
- **Yellow warning banner:** Schedule conflict detected
- **Green success banner:** Schedule created successfully

---

## 🎨 UI Features

### Multi-Select Component:
- **Dropdown:** Click to open/close
- **Checkboxes:** Click to select/deselect
- **Tags:** Selected items shown as removable pills
- **Clear All:** Quick button to remove all selections
- **Counter:** Shows "X member(s) selected"

### Date/Time Pickers:
- **Fully Clickable:** Click anywhere on field to open picker
- **Visual Icons:** Calendar and clock icons for clarity
- **Native Pickers:** Uses browser's built-in date/time pickers
- **Validation:** Cannot select past dates

### Step-by-Step Guidance:
- Clear section labels (Step 1, Step 2, etc.)
- Helper text under each field
- Required field indicators (*)
- Visual separation between sections

---

## 🔧 Troubleshooting

### "No conflicts found but submit blocked"
- Check all required fields are filled
- Verify incident is selected
- Ensure at least one staff member selected

### "Unable to connect to server"
- Check backend is running (`node server.js`)
- Verify port 3000 is not blocked
- Check database connection

### "Schedule conflict detected"
- Review yellow warning message
- Check staff member names and times
- Adjust schedule time by 2+ hours
- Or select different staff members

### "No animal catchers in dropdown"
- Run: `node insert-sample-catchers.sql`
- Check database connection
- Verify dog_catcher table has data

---

## 📱 Mobile Usage

The patrol schedule interface is fully responsive:
- Touch-friendly checkboxes
- Large tap targets
- Scrollable dropdowns
- Mobile-optimized date/time pickers

---

## 🎯 Best Practices

### When Creating Schedules:

1. **Plan Ahead:** Schedule at least 2 hours buffer between patrols
2. **Team Size:** Assign 2-3 staff for complex incidents
3. **Notes:** Always add safety notes for dangerous animals
4. **Time Buffer:** Leave travel time between locations
5. **Staff Availability:** Check team availability before assigning

### Workflow Tips:

1. **Batch Scheduling:** Create multiple schedules at once
2. **Status Updates:** Update status in real-time during patrols
3. **Filters:** Use search and filters to find specific schedules
4. **Regular Review:** Check completed schedules for reporting

---

## 📞 Quick Actions

| Action | Steps |
|--------|-------|
| Create schedule | "New Schedule" → Select staff → Pick incident → Set time → Submit |
| Start patrol | Find schedule → Click "Start" |
| Complete patrol | Find in-progress schedule → Click "Complete" |
| Check conflicts | Create schedule → System checks automatically |
| Filter by status | Use dropdown: "All Status" → "In Progress" |
| Search schedules | Type in search box (incident/staff/location) |

---

## ✅ Success Indicators

You'll know it's working when:
- ✓ 12 animal catchers appear in dropdown
- ✓ Checkboxes respond to clicks (no CTRL needed)
- ✓ Selected staff show as orange tags
- ✓ Date/time fields open with single click
- ✓ Conflict warnings appear when detected
- ✓ Green success message after creation
- ✓ Schedules appear in table immediately

---

## 🆘 Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review error messages carefully
3. Verify backend logs for API errors
4. Check browser console for frontend errors
5. Ensure database has sample data

---

## 📚 Related Documentation

- **Full Implementation:** See `PATROL_SCHEDULE_ENHANCEMENT_COMPLETE.md`
- **API Documentation:** Check backend server root (http://localhost:3000/)
- **Test Suite:** Run `node test-patrol-schedule-complete.js`

---

**Last Updated:** January 7, 2026
**Version:** 1.0.0
**Status:** Production Ready ✓
