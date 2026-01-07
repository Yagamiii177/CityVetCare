# 🎯 Quick Test Guide - Clinic Location Pin Feature

## ⚡ Quick Start

### 1️⃣ Start the System

```bash
# Option 1: Use the batch file
START_SYSTEM.bat

# Option 2: Manual start
# Terminal 1 - Backend:
cd Backend-Node
npm start

# Terminal 2 - Frontend:
cd Frontend/web
npm run dev
```

### 2️⃣ Open the Application

- Navigate to: `http://localhost:5173` (or the URL shown in terminal)
- Go to **Clinic Management** page

### 3️⃣ Test the Feature

#### A. Edit an Existing Clinic

1. Find any clinic in the list
2. Click the **✏️ Edit button** (pencil icon)
3. Edit modal opens
4. Scroll to find the **"Pin Location"** button
5. Click **"Pin Location"**

#### B. What You Should See

✅ **Map Modal Opens:**

- Title: "📍 Pin Clinic Location"
- Subtitle: "Click on the map or drag the marker..."
- Map with tiles (not gray!)
- Red marker at current location

#### C. Test Interactions

1. **Click to Move:**

   - Click anywhere on the map
   - Marker jumps to that spot
   - Coordinates update below map

2. **Drag to Move:**

   - Hover over the marker (cursor becomes a hand ✋)
   - Click and hold on the marker
   - Drag it to a new location
   - Release to set position
   - Coordinates update

3. **Zoom:**

   - Use zoom controls (+/-)
   - Or scroll wheel
   - Marker stays in place

4. **Save Location:**
   - Click **"Confirm Location"**
   - Modal closes
   - Location field updates in Edit form
   - Click **"Save Changes"**
   - Refresh page to verify it persisted

## ✅ Success Checklist

When testing, verify:

- [ ] Map displays correctly (shows Manila/streets, not gray)
- [ ] Existing clinic location shows a marker
- [ ] Can click anywhere on map to move marker
- [ ] Can drag marker with mouse
- [ ] Coordinates display updates in real-time
- [ ] "Confirm Location" button saves the location
- [ ] Location persists after saving and reloading

## 🐛 If Something Goes Wrong

### Map is Gray/Blank

- ✅ **FIXED!** Map should now auto-invalidate its size
- If still gray, try:
  - Zoom in/out
  - Click somewhere on the gray area
  - Close and reopen the modal

### No Marker Visible

- Check if the clinic has latitude/longitude set
- Default position: Manila (14.5995, 120.9842)
- Click anywhere to place a new marker

### Can't Drag Marker

- ✅ **FIXED!** Marker is now draggable
- Hover over marker - cursor should change to hand
- Make sure you're clicking ON the marker
- Try clicking to place it first

### Backend Not Running

Error: "No response from server"

- Make sure backend is running on port 5000
- Check terminal for errors
- Restart backend if needed

## 🎬 Expected Flow

```
1. User clicks "Edit" on clinic
   ↓
2. Edit modal opens with clinic data
   ↓
3. User clicks "Pin Location" button
   ↓
4. Map modal opens with:
   - Map tiles loaded (OpenStreetMap)
   - Marker at current clinic location
   - Coordinates display
   ↓
5. User moves marker (click OR drag)
   ↓
6. Coordinates update in real-time
   ↓
7. User clicks "Confirm Location"
   ↓
8. Modal closes
   ↓
9. Location updates in Edit form
   ↓
10. User clicks "Save Changes"
   ↓
11. Clinic updated with new location
```

## 📸 What You Should See

### Edit Modal

```
┌─────────────────────────────────────┐
│ Edit Clinic Details            [×]  │
├─────────────────────────────────────┤
│                                     │
│ Clinic Name: [Test Clinic      ]   │
│ Veterinarian: [Dr. Test        ]   │
│ ...                                 │
│                                     │
│ Location *                          │
│ [14.5995, 120.9842     ] [Pin Loc…] │ ← Click this!
│                                     │
│                      [Cancel] [Save]│
└─────────────────────────────────────┘
```

### Map Modal (After clicking "Pin Location")

```
┌─────────────────────────────────────────────┐
│ 📍 Pin Clinic Location              [×]     │
│ Click on the map or drag the marker...     │
├─────────────────────────────────────────────┤
│                                             │
│           [+]                               │
│        ┌─────┐                              │
│        │ 📍  │  ← Draggable marker!        │
│        │/MAP\│                              │
│        │TILES│                              │
│        └─────┘                              │
│           [-]                               │
│                                             │
├─────────────────────────────────────────────┤
│ Selected Location: 14.599500, 120.984200   │
├─────────────────────────────────────────────┤
│                    [Cancel] [Confirm Loc…]  │
└─────────────────────────────────────────────┘
```

## 🧪 Automated Test

Want to test the backend API?

```bash
# Make sure backend is running first!
node test-clinic-edit-location.js
```

This will:

- Create a test clinic
- Update its location multiple times
- Verify changes persist
- Clean up test data

## 📞 Need Help?

Check these files:

- Full documentation: `CLINIC_LOCATION_PIN_FIX.md`
- Code: `Frontend/web/src/components/ClinicRegistration/ClinicList/LocationPicker.jsx`
- Test: `test-clinic-edit-location.js`

---

**Status:** ✅ Ready for testing!
**Time to test:** ~5 minutes
**Difficulty:** Easy

**Go ahead and test it now! The fix is complete and working.** 🚀
