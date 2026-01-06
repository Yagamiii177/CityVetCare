# Authenticated Incident Report Fix

## Problem
When users logged in and tried to report an incident, they received: "Failed to submit your report. Please check your internet connection and try again."

## Root Cause
The `apiService.js` was **not including the JWT authentication token** in the request headers when submitting incidents. 

### Code Analysis:
1. ✅ Backend accepts both authenticated and unauthenticated requests
2. ✅ Emergency reports (without login) worked fine
3. ❌ Authenticated reports (after login) failed because:
   - Token was stored in AsyncStorage by auth system
   - But `apiService.js` wasn't retrieving or sending it

## Solution
Updated `Frontend/mobile/services/apiService.js`:

### Changes Made:

1. **Added AsyncStorage import** to access stored tokens
2. **Created getAccessToken() function** to retrieve JWT from storage
3. **Enhanced fetchWithError()** to automatically include Authorization header when token exists
4. **Updated uploadImages()** to include token for image uploads

### Key Code Changes:

```javascript
// Before: No token handling
const fetchWithError = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  // ...
};

// After: Automatic token inclusion
const fetchWithError = async (url, options = {}) => {
  const token = await getAccessToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Request with authentication');
  } else {
    console.log('🔓 Request without authentication (emergency report)');
  }

  const response = await fetch(url, { ...options, headers });
  // ...
};
```

## Testing

### Test Results:
✅ **Authenticated submission** - Works with JWT token
✅ **Emergency submission** - Works without token  
✅ **Image upload with auth** - Token included in multipart requests
✅ **Backward compatibility** - Emergency reports still work

### Test Command:
```bash
node test-authenticated-report.js
```

## Impact
- ✅ Users can now submit incident reports after logging in
- ✅ Emergency reports (without login) still work
- ✅ All requests automatically include authentication when available
- ✅ Better security: authenticated users are identified in reports

## User Action Required
**Reload your Expo app** on iPhone:
1. Shake device
2. Tap "Reload"
3. Login with: `iphoneuser` / `iphone123`
4. Go to Reports → Report an Incident
5. Fill form, pin location, submit
6. ✅ Should work now!

## Technical Details
- Storage Key: `@cityvetcare_access_token`
- Token Type: JWT Bearer token
- Expiration: 7 days
- Auto-refresh: Not yet implemented (future enhancement)
