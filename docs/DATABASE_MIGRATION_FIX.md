# Database Migration: Update Stored Procedures

## Problem Fixed
The stored procedures `sp_incidents_create` and `sp_incidents_update` were outdated and didn't include the mobile report fields (pet_color, pet_breed, animal_type, pet_gender, pet_size, incident_type).

## Solution Applied

### 1. Backend Model Fixed
Updated `Backend-Node/models/Incident.js`:
- Fixed parameter order to match stored procedure
- Added missing `priority` parameter
- Changed result extraction from `incident_id` to `id`

### 2. Database Update Required
You need to apply the stored procedure updates to your database.

## How to Apply Database Update

### Option 1: Using MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `Database/migrations/FIX_DATABASE_NOW.sql`
4. Execute the entire script

### Option 2: Using MySQL Command Line
```bash
mysql -u root -p cityvetcare_db < Database/migrations/FIX_DATABASE_NOW.sql
```

### Option 3: Copy and Paste
1. Open the file `Database/migrations/FIX_DATABASE_NOW.sql`
2. Copy all content
3. Paste into MySQL Workbench or command line
4. Execute

## Verification

After applying the update, verify it works:

1. Start the backend server:
   ```bash
   cd Backend-Node
   npm start
   ```

2. Try creating a new incident report from the web frontend

3. Check the backend logs - should see success message

## What Changed

### Stored Procedure Parameters (18 total):
1. reporter_name
2. reporter_contact
3. title
4. description
5. location
6. latitude
7. longitude
8. incident_date
9. **priority** (was missing before)
10. status
11. images
12. assigned_catcher_id
13. **incident_type** (new)
14. **pet_color** (new)
15. **pet_breed** (new)
16. **animal_type** (new)
17. **pet_gender** (new)
18. **pet_size** (new)

## Testing

After update, test by:
1. Going to All Incident Report page
2. Click "New Report" button
3. Fill in the form
4. Submit

Should work without database errors!
