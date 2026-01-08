# 📱 Mobile Announcement Feature - Complete Setup Guide

## ✅ What's Been Created

### **1. Backend Updates**

- ✅ Enhanced `/api/announcements` endpoint to support image attachments
- ✅ Added status filtering for mobile users (only Published announcements)
- ✅ Integrated `announcement_attachment` table support
- ✅ Added view counter increment on announcement detail view
- ✅ Database seeding script for sample announcement images

### **2. Frontend Mobile Components**

- ✅ `AnnouncementListScreen.js` - Main list view with categories
- ✅ `AnnouncementDetailScreen.js` - Detail view with image carousel/swiping
- ✅ `announcementService.js` - API service layer
- ✅ Updated API configuration with announcement endpoints

### **3. Features Implemented**

#### **Announcement List Screen**

- ✅ Fetch published announcements from backend
- ✅ Categorize by date (Today, Yesterday, Past)
- ✅ Pull-to-refresh functionality
- ✅ Loading and error states
- ✅ Image preview with count badge
- ✅ Category icons and colors
- ✅ Priority badges
- ✅ View count display
- ✅ Click to view details

#### **Announcement Detail Screen**

- ✅ **Image Carousel with Swiping**
  - Horizontal scrollable image gallery
  - Dot indicators for multiple images
  - Image counter (e.g., "2 / 5")
  - Smooth swipe transitions
- ✅ Full announcement content display
- ✅ Category and priority badges
- ✅ Author and date information
- ✅ View count tracking
- ✅ Additional metadata display

---

## 🚀 Setup Instructions

### **Step 1: Run Database Migrations**

The `announcement_attachment` table should already exist from the schema. Verify it:

```sql
DESCRIBE announcement_attachment;
```

If it doesn't exist, run:

```bash
cd Backend-Node
node setup-database.js
```

### **Step 2: Seed Sample Announcement Images**

```bash
cd Backend-Node
node seed-announcement-images.js
```

This will add sample image attachments to your announcements.

### **Step 3: Manually Add Image Attachments (Optional)**

If you want to add real images to announcements:

1. Create the directory:

   ```bash
   mkdir -p Backend-Node/uploads/announcements
   ```

2. Copy your images to that folder

3. Insert into database:
   ```sql
   INSERT INTO announcement_attachment
   (announcement_id, file_name, file_type, file_size, file_url, storage_path)
   VALUES
   (1, 'campaign-image.jpg', 'image/jpeg', 245600, '/uploads/announcements/campaign-image.jpg', 'uploads/announcements/campaign-image.jpg');
   ```

### **Step 4: Update Mobile App Navigation**

Add the detail screen to your navigation stack. In your navigation file (likely `App.js` or navigation config):

```javascript
import AnnouncementScreen from './screens/CampaignManagement/AnnouncementScreen';
import AnnouncementDetailScreen from './screens/CampaignManagement/AnnouncementDetailScreen';

// In your Stack.Navigator:
<Stack.Screen
  name="Announcements"
  component={AnnouncementScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="AnnouncementDetail"
  component={AnnouncementDetailScreen}
  options={{ headerShown: false }}
/>
```

### **Step 5: Test the Backend**

```bash
# Test announcement list
curl http://localhost:3000/api/announcements?status=Published

# Test single announcement with images
curl http://localhost:3000/api/announcements/1
```

Expected response:

```json
{
  "data": {
    "id": 1,
    "title": "Anti-Rabies Vaccination Campaign",
    "description": "...",
    "category": "health",
    "attachments": [
      {
        "id": 1,
        "fileName": "campaign-1.jpg",
        "fileUrl": "/uploads/announcements/campaign-1.jpg",
        "fileType": "image/jpeg"
      }
    ],
    "views": 15
  }
}
```

### **Step 6: Start Mobile App**

```bash
cd Frontend/mobile
npm start
```

Then:

- Press `a` for Android
- Press `i` for iOS
- Scan QR code for physical device

---

## 🎨 UI Features Explained

### **Image Swiping (Carousel)**

The detail screen includes a fully functional image carousel:

```javascript
// Horizontal scrollable
<ScrollView
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onScroll={handleScroll}
>
  {images.map((image, index) => (
    <Image source={{ uri: getImageUrl(image.fileUrl) }} />
  ))}
</ScrollView>;

// Dot indicators
{
  images.map((_, index) => (
    <TouchableOpacity onPress={() => scrollToImage(index)}>
      <View style={[styles.indicator, active && styles.indicatorActive]} />
    </TouchableOpacity>
  ));
}
```

**Features:**

- ✅ Swipe left/right to navigate images
- ✅ Tap dots to jump to specific image
- ✅ Image counter shows current position
- ✅ Smooth animations
- ✅ Works with 1 or multiple images

### **Category Colors**

```javascript
const colors = {
  health: "#dc3545", // Red
  policy: "#0d6efd", // Blue
  events: "#28a745", // Green
  general: "#6c757d", // Gray
};
```

### **Priority Colors**

```javascript
const colors = {
  High: "#dc3545", // Red
  Medium: "#ffc107", // Yellow
  Low: "#28a745", // Green
};
```

---

## 📊 Database Schema

### `announcement` Table

```sql
announcement_id | title | content | category | priority | status | views | attachments
```

### `announcement_attachment` Table

```sql
attachment_id | announcement_id | file_name | file_url | file_type | file_size
```

---

## 🔌 API Endpoints

### **Get Published Announcements** (Mobile)

```
GET /api/announcements?status=Published
```

Response:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Anti-Rabies Campaign",
      "category": "health",
      "priority": "High",
      "views": 25,
      "attachments": [...]
    }
  ]
}
```

### **Get Single Announcement**

```
GET /api/announcements/:id
```

- Increments view count automatically
- Returns full details with attachments

---

## 🧪 Testing Checklist

### **Backend Tests**

- [ ] GET `/api/announcements?status=Published` returns only published items
- [ ] GET `/api/announcements/:id` returns announcement with attachments
- [ ] View count increments on each request
- [ ] Images are accessible at `/uploads/announcements/`

### **Mobile Tests**

- [ ] List screen loads announcements from API
- [ ] Pull-to-refresh works
- [ ] Clicking announcement navigates to detail screen
- [ ] Image carousel swipes smoothly
- [ ] Dot indicators update correctly
- [ ] Multiple images display counter
- [ ] Single images don't show indicators
- [ ] Loading states display properly
- [ ] Error states show retry button
- [ ] Empty state displays when no announcements

---

## 🎯 Next Steps

### **Add Image Upload for Admins**

Update the admin web dashboard to allow uploading multiple images:

```javascript
// In NewAnnouncement.jsx
const handleImageUpload = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch("/api/announcements/:id/attachments", {
    method: "POST",
    body: formData,
  });
};
```

### **Add Backend Upload Endpoint**

```javascript
// In routes/announcements.js
router.post(
  "/:id/attachments",
  upload.array("images", 10),
  async (req, res) => {
    // Save files and create attachment records
  }
);
```

### **Enable Offline Support**

Store fetched announcements in AsyncStorage for offline viewing.

### **Add Push Notifications**

Notify users when new announcements are published.

---

## 📱 Mobile App Structure

```
Frontend/mobile/
├── screens/CampaignManagement/
│   ├── AnnouncementScreen.js           (Wrapper - backward compatible)
│   ├── AnnouncementListScreen.js       (Main list view)
│   └── AnnouncementDetailScreen.js     (Detail with image swiper)
├── services/
│   └── announcementService.js          (API calls)
└── config/
    └── api-config.js                   (Endpoints configuration)
```

---

## ✨ Summary

You now have a **complete mobile announcement system** with:

- ✅ Backend API with image attachment support
- ✅ Mobile list view with categorization
- ✅ **Image carousel with swipe functionality**
- ✅ Full detail view with metadata
- ✅ Real-time data from admin-created announcements
- ✅ Pull-to-refresh and loading states
- ✅ Clean, modern UI design

**The mobile app now displays announcements created by admins on the web dashboard, including multiple swipeable images!** 🎉
