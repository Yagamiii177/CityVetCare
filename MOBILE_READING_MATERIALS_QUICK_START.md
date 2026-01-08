# 🚀 Quick Start Guide - Mobile Reading Materials

## ⚡ Test the Mobile Reading Materials Feature

### 📋 Prerequisites

1. **Backend Running:**

   ```bash
   cd Backend-Node
   npm start
   ```

   Server should be running on `http://localhost:3000`

2. **Update Mobile API Config:**

   - Open: `Frontend/mobile/config/api.js`
   - Update `API_BASE_URL`:
     - **Android Emulator:** `http://10.0.2.2:3000`
     - **iOS Simulator:** `http://localhost:3000`
     - **Physical Device:** `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)

   Find your IP:

   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` → Look for inet address

3. **Create Test Materials (Admin Dashboard):**
   - Open: `http://localhost:5173/reading-material`
   - Click "Add New Material"
   - Fill in:
     - Title: "Understanding Rabies Prevention"
     - Type: "Article"
     - Author: "Dr. Jane Doe"
     - Description: "Essential guide to rabies prevention"
     - Content: "Rabies is a deadly virus... (add full content)"
     - Add tags: "rabies", "prevention", "health"
     - Upload cover image (optional)
     - **Status: Published** ⚠️ Important!
   - Click "Save"
   - Create 2-3 more materials for testing

---

## 📱 Running the Mobile App

### **Expo Go (Recommended for Quick Test):**

```bash
cd Frontend/mobile
npm install
npx expo start
```

Then:

- Scan QR code with Expo Go app
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator

---

## 🧪 Testing Steps

### **1. Navigate to Reading Materials:**

```
Home Screen
  → Campaign Management
    → Select "Reading Materials"
```

### **2. Test Features:**

#### ✅ **Browse Materials:**

- [ ] All published materials load
- [ ] Material cards display correctly
- [ ] Images show (if added)
- [ ] Type badges show (📚 Book, 🌐 Website, etc.)

#### ✅ **Search:**

- [ ] Type in search bar
- [ ] Results filter in real-time
- [ ] Clear button works
- [ ] "No results" shows when no match

#### ✅ **Filters:**

- [ ] Tap "All", "Books", "Websites", "Digital", "Articles"
- [ ] Materials filter correctly
- [ ] Count updates

#### ✅ **Material Cards:**

- [ ] Tap "See More" to expand
- [ ] Full content displays
- [ ] Tags show
- [ ] Reading time shows
- [ ] External link appears (if URL added)
- [ ] Tap "See Less" to collapse

#### ✅ **Detail Screen:**

- [ ] Tap on a material card
- [ ] Detail screen opens
- [ ] Full content readable
- [ ] Image gallery works (swipe if multiple images)
- [ ] Share button works
- [ ] External link button works (if URL exists)

#### ✅ **Refresh:**

- [ ] Pull down to refresh
- [ ] New materials appear

#### ✅ **Error Handling:**

- [ ] Turn off backend
- [ ] Error message shows
- [ ] Retry button appears
- [ ] Click retry, turn on backend
- [ ] Materials load

---

## 🔍 Common Issues & Solutions

### **Issue: "Failed to load reading materials"**

**Solutions:**

1. Check backend is running: `http://localhost:3000/api/health`
2. Check `API_BASE_URL` in `Frontend/mobile/config/api.js`
3. Check firewall allows port 3000
4. For physical device, ensure phone and computer on same WiFi

### **Issue: "No materials found"**

**Solutions:**

1. Go to admin dashboard: `http://localhost:5173/reading-material`
2. Check materials exist
3. **Verify status is "Published"** (not "Draft" or "Archived")
4. Mobile only shows published materials

### **Issue: Images not showing**

**Solutions:**

1. Check image was uploaded successfully in admin
2. Check image URL format in database
3. Ensure backend `/uploads` folder accessible
4. Check `getImageUrl()` function in service

### **Issue: App crashes on navigation**

**Solutions:**

1. Check all screens imported in `App.js`
2. Check navigation names match
3. Clear Expo cache: `npx expo start -c`
4. Reinstall: `rm -rf node_modules && npm install`

---

## 📊 Expected Behavior

### **On Load:**

```
1. Show loading spinner
2. Fetch materials from backend
3. Filter for published only
4. Display in cards
5. Show count: "5 materials found"
```

### **On Search:**

```
1. User types "rabies"
2. Filter materials by keyword
3. Update display immediately
4. Show count: "2 materials found"
```

### **On Filter:**

```
1. User taps "Books"
2. Show only book type materials
3. Update count
```

### **On Detail View:**

```
1. User taps material
2. Navigate to detail screen
3. Show full content
4. Enable share and external link
```

---

## 🎯 Quick Test Script

**Complete this in 5 minutes:**

1. ✅ Start backend (`cd Backend-Node && npm start`)
2. ✅ Create 1 published material in admin
3. ✅ Start mobile app (`cd Frontend/mobile && npx expo start`)
4. ✅ Navigate: Home → Campaign → Reading Materials
5. ✅ Verify material shows
6. ✅ Tap "See More"
7. ✅ Verify content expands
8. ✅ Search for keyword
9. ✅ Pull to refresh
10. ✅ Tap material to view detail

**All working? 🎉 Success!**

---

## 📞 Need Help?

**Check These Files:**

- Service: `Frontend/mobile/services/readingMaterialService.js`
- Main Screen: `Frontend/mobile/screens/CampaignManagement/ReadingMaterialsScreen.js`
- Detail Screen: `Frontend/mobile/screens/CampaignManagement/ReadingMaterialDetailScreen.js`
- API Config: `Frontend/mobile/config/api.js`
- Navigation: `Frontend/mobile/App.js`

**Backend Endpoints:**

- List: `GET http://localhost:3000/api/reading-materials`
- Detail: `GET http://localhost:3000/api/reading-materials/:id`

**Test in Browser:**

```
http://localhost:3000/api/reading-materials
```

Should return JSON array of materials

---

## 🎨 Customization

### **Change Colors:**

Edit `ReadingMaterialsScreen.js`:

```javascript
filterButtonActive: {
  backgroundColor: "#YOUR_COLOR", // Change here
}
```

### **Add New Material Types:**

Edit `readingMaterialService.js`:

```javascript
const icons = {
  book: "📚",
  website: "🌐",
  your_new_type: "🎯", // Add here
};
```

---

## ✅ Final Checklist

Before considering complete:

- [ ] Backend running and accessible
- [ ] At least 1 published material exists
- [ ] Mobile app connects successfully
- [ ] Materials display correctly
- [ ] Search works
- [ ] Filters work
- [ ] Detail screen works
- [ ] Share works
- [ ] No console errors
- [ ] Smooth navigation

**All checked? You're ready to go! 🚀**
