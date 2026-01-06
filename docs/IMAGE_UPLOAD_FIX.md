# 🖼️ Image Upload Fix - Report Images Persistence

## Problem Description

When users submitted reports with images from the mobile app and viewed them in the web dashboard's "Pending Verification" or "All Incident Reports" pages, the images would show initially but disappear after refreshing the page.

### Root Cause

The mobile app was storing **local device file URIs** (like `file:///data/...` or `content://...`) directly in the database. These URIs:
- ✅ Work on the mobile device that captured the image
- ❌ Don't work on other devices or web browsers
- ❌ Become inaccessible after the app closes or device restarts

## Solution Implemented

Implemented proper image upload functionality with server-side storage:

### 1. Backend Changes

#### Installed Dependencies
```bash
npm install multer
```

#### Created Upload Configuration (`Backend-Node/config/multer.js`)
- Configured `multer` for handling multipart/form-data image uploads
- Set up disk storage in `Backend-Node/uploads/incident-images/`
- Added file validation (only images: jpeg, jpg, png, gif, webp)
- Set 5MB file size limit per image
- Generated unique filenames to prevent conflicts

#### Added Image Upload Endpoint (`Backend-Node/routes/incidents.js`)
```javascript
POST /api/incidents/upload-images
- Accepts up to 10 images
- Returns array of server URLs
- Example response: ["/uploads/incident-images/image-123456789.jpg"]
```

#### Configured Static File Serving (`Backend-Node/server.js`)
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
This allows images to be accessed via URL like: `http://localhost:3000/uploads/incident-images/image.jpg`

### 2. Mobile App Changes

#### Updated API Service (`Frontend/mobile/services/apiService.js`)
- Added `uploadImages()` method that:
  1. Converts local image URIs to FormData
  2. Uploads images to server
  3. Returns server-accessible URLs
- Modified `create()` method to:
  1. Upload images first
  2. Use returned server URLs in the report data
  3. Submit report with server URLs instead of local URIs

### 3. Web Frontend Changes

#### Added Image URL Helper (`Frontend/web/src/utils/api.js`)
```javascript
export const getImageUrl = (imagePath) => {
  // Converts relative paths to full URLs
  // Example: "/uploads/..." → "http://localhost:3000/uploads/..."
}
```

#### Updated Components
- ✅ `PendingVerification.jsx` - Uses `getImageUrl()` for image display
- ✅ `MonitoringIncidents.jsx` - Uses `getImageUrl()` for image display
- ✅ `AllIncidentReport.jsx` - Uses `getImageUrl()` for image display

## How It Works Now

### Flow Diagram
```
Mobile App
  └─> User selects images (local URIs)
      └─> Submit button pressed
          └─> 1. Upload images to server
              │   POST /api/incidents/upload-images
              │   FormData with image files
              └─> 2. Receive server URLs
                  │   ["/uploads/incident-images/img1.jpg", ...]
                  └─> 3. Create incident report
                      │   POST /api/incidents
                      │   { ..., images: [server URLs] }
                      └─> 4. Database stores server URLs
                          └─> Web Dashboard can now access images ✓
```

### Before vs After

**BEFORE (Broken)**:
```json
{
  "images": [
    "file:///data/user/0/com.app/cache/image1.jpg",  // ❌ Only works on device
    "content://media/external/images/media/123"       // ❌ Not accessible via web
  ]
}
```

**AFTER (Fixed)**:
```json
{
  "images": [
    "/uploads/incident-images/dog-1735979157736-123456789.jpg",  // ✓ Server path
    "/uploads/incident-images/cat-1735979157740-987654321.jpg"   // ✓ Accessible via HTTP
  ]
}
```

## Testing the Fix

### Test on Mobile App
1. Open the mobile app
2. Navigate to "Report Incident"
3. Fill in the form and **select 2-3 images**
4. Add location and submit
5. ✓ You should see "Report submitted successfully"

### Test on Web Dashboard
1. Open web dashboard at `http://localhost:5173`
2. Go to "Pending Verification" page
3. Find your newly submitted report
4. Click "View" to see details
5. ✓ Images should be displayed
6. **Refresh the page** (F5)
7. ✓ Images should **still be visible** after refresh!

### Verify Image Storage
```powershell
# Check uploaded images on server
dir Backend-Node\uploads\incident-images\
```

You should see image files like:
```
dog-1735979157736-123456789.jpg
cat-1735979157740-987654321.jpg
```

## Configuration

### Mobile App API Configuration
File: `Frontend/mobile/config/api.js`

Make sure the API base URL matches your environment:
```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000';

// For iOS Simulator
// const API_BASE_URL = 'http://localhost:3000';

// For Physical Device (replace with your computer's IP)
// const API_BASE_URL = 'http://192.168.1.100:3000';
```

### Web App Environment
File: `Frontend/web/.env`

Ensure API URL is set:
```env
VITE_API_URL=http://localhost:3000/api
```

## File Structure

```
Backend-Node/
├── config/
│   └── multer.js                 # ✨ NEW: Image upload configuration
├── routes/
│   └── incidents.js              # ✅ UPDATED: Added upload endpoint
├── server.js                     # ✅ UPDATED: Static file serving
└── uploads/                      # ✨ NEW: Image storage directory
    ├── .gitkeep
    └── incident-images/          # Images stored here
        ├── image-123.jpg
        └── image-456.jpg

Frontend/
├── mobile/
│   └── services/
│       └── apiService.js         # ✅ UPDATED: Image upload logic
└── web/
    └── src/
        ├── utils/
        │   └── api.js            # ✅ UPDATED: Added getImageUrl()
        └── pages/
            └── ReportManagement/
                ├── PendingVerification.jsx      # ✅ UPDATED
                ├── MonitoringIncidents.jsx      # ✅ UPDATED
                └── AllIncidentReport.jsx        # ✅ UPDATED
```

## Benefits

✅ **Persistent Images**: Images remain accessible after page refresh
✅ **Cross-Device Access**: Any device can view images via HTTP
✅ **Scalable**: Supports multiple images per report
✅ **Secure**: File type validation and size limits
✅ **Performance**: Optimized with unique filenames
✅ **Maintainable**: Clean separation of concerns

## Troubleshooting

### Images Not Showing
1. **Check backend is running**: `http://localhost:3000`
2. **Check uploads directory exists**: `Backend-Node/uploads/incident-images/`
3. **Check CORS settings**: Backend allows requests from web frontend
4. **Check browser console**: Look for 404 or CORS errors

### Mobile App Upload Fails
1. **Check internet connection**: Mobile device must reach backend
2. **Check API URL**: Correct IP/port in `api.js`
3. **Check permissions**: Camera and storage permissions granted
4. **Check file size**: Images under 5MB limit

### Database Shows Old URIs
Old reports with local URIs will still have broken images. New reports submitted after this fix will work correctly. To fix old reports, you would need to either:
- Delete old test reports
- Or manually update their image URLs in the database

## Notes

- Maximum 10 images per upload
- Maximum 5MB per image
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Images stored permanently on server until manually deleted
- Consider implementing cleanup for deleted reports in the future

---

**Status**: ✅ **FIXED AND TESTED**
**Date**: January 4, 2026
**Version**: 2.0.0
