-- Fix Database Issues
-- Run this to fix the missing columns and enum values

USE cityvetcare_db;

-- 1. Add incident_type column if missing
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS incident_type ENUM('bite', 'stray', 'abuse', 'health', 'other') DEFAULT 'other'
AFTER priority;

-- 2. Modify status enum to include PENDING_VERIFICATION (if not already there)
-- Note: MySQL doesn't allow IF NOT EXISTS for enum modification
-- We'll check if the value exists first

-- First, check current status enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cityvetcare_db' 
  AND TABLE_NAME = 'incidents' 
  AND COLUMN_NAME = 'status';

-- If PENDING_VERIFICATION is missing, uncomment and run:
-- ALTER TABLE incidents 
-- MODIFY COLUMN status ENUM(
--   'pending',
--   'pending_verification',
--   'PENDING_VERIFICATION',
--   'approved',
--   'scheduled',
--   'verified',
--   'in_progress',
--   'resolved',
--   'rejected',
--   'cancelled'
-- ) DEFAULT 'pending';

-- 3. Add verified_by column if needed for veterinarian verification
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS verified_by INT NULL
AFTER status;

ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL
AFTER verified_by;

-- 4. Add foreign key for verified_by
-- First check if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) 
                  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                  WHERE CONSTRAINT_SCHEMA = 'cityvetcare_db' 
                    AND TABLE_NAME = 'incidents' 
                    AND CONSTRAINT_NAME = 'fk_incidents_verified_by');

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE incidents ADD CONSTRAINT fk_incidents_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "Foreign key already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Verify the changes
DESCRIBE incidents;

SELECT 'Database fixes completed successfully!' as Status;
