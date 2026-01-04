-- Migration: Fix empty incident_type values
-- Date: 2026-01-04
-- Description: Update empty string incident_type values to 'incident' (default)

USE cityvetcare_db;

-- Update empty strings to 'incident' (default)
UPDATE incidents 
SET incident_type = 'incident' 
WHERE incident_type = '' OR incident_type IS NULL;

-- Show updated records
SELECT id, title, incident_type, status 
FROM incidents 
ORDER BY id DESC 
LIMIT 10;

SELECT 'Migration completed - Fixed empty incident_type values' as Status;
