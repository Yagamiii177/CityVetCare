# Test Login Instructions

## Step 1: Make sure your backend is running
```powershell
cd Backend-Node
node server.js
```

## Step 2: Make sure your frontend is running
```powershell
cd Frontend/web
npm run dev
```

## Step 3: Open your browser
Navigate to: `http://localhost:5173/login`

## Step 4: Login with test credentials
Use one of these accounts:

### For Dashboard Access (Recommended):
- **Username:** `vet1`
- **Password:** `test123`
- **Role:** veterinarian (has access to dashboard)

### Alternative:
- **Username:** `catcher1`  
- **Password:** `test123`
- **Role:** catcher (has access to schedules)

### Regular User (Limited Access):
- **Username:** `testuser`
- **Password:** `test123`
- **Role:** user (cannot access dashboard)

## Step 5: After Login
You should be redirected to `/vaccination-dashboard` and see your username displayed.

## If Dashboard Still Shows 401 Errors:

1. Open Browser Developer Tools (F12)
2. Go to Application tab → Local Storage
3. Check if you see:
   - `accessToken`
   - `refreshToken`
   - `user`

If these are missing, the login didn't work correctly.

## Debug: Check Backend Response

In Backend terminal, you should see:
```
POST /api/auth/login 200
```

If you see 401 or other errors, the credentials might be wrong.
