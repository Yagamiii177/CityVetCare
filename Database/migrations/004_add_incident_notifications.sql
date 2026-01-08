-- Notification System Database Migration
-- Adds owner_id and incident_id columns to notifications table
-- For CityVetCare Incident Notification System
-- Run this if automatic schema updates fail

USE cityvetcare_db;

-- Step 1: Check if notifications table exists
-- If not, the backend will create it automatically on first run

-- Step 2: Add owner_id column if it doesn't exist
-- This links notifications to authenticated pet owners
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'cityvetcare_db' 
    AND TABLE_NAME = 'notifications' 
    AND COLUMN_NAME = 'owner_id'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE notifications ADD COLUMN owner_id INT NULL COMMENT "FK to pet_owner.owner_id for authenticated pet owners" AFTER user_type',
  'SELECT "owner_id column already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add incident_id column if it doesn't exist
-- This links notifications to specific incident reports
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'cityvetcare_db' 
    AND TABLE_NAME = 'notifications' 
    AND COLUMN_NAME = 'incident_id'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE notifications ADD COLUMN incident_id INT NULL COMMENT "FK to incident_report.report_id" AFTER owner_id',
  'SELECT "incident_id column already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add index on owner_id for faster queries
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'cityvetcare_db' 
    AND TABLE_NAME = 'notifications' 
    AND INDEX_NAME = 'idx_owner_notifications'
);

SET @sql = IF(
  @index_exists = 0,
  'ALTER TABLE notifications ADD INDEX idx_owner_notifications (owner_id)',
  'SELECT "idx_owner_notifications already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Add index on incident_id for faster queries
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'cityvetcare_db' 
    AND TABLE_NAME = 'notifications' 
    AND INDEX_NAME = 'idx_incident_notifications'
);

SET @sql = IF(
  @index_exists = 0,
  'ALTER TABLE notifications ADD INDEX idx_incident_notifications (incident_id)',
  'SELECT "idx_incident_notifications already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Verify the migration
SELECT 
  'Migration Complete!' AS status,
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cityvetcare_db'
  AND TABLE_NAME = 'notifications'
  AND COLUMN_NAME IN ('owner_id', 'incident_id')
ORDER BY ORDINAL_POSITION;

-- Step 7: Show indexes
SELECT 
  'Indexes Created:' AS status,
  INDEX_NAME,
  COLUMN_NAME,
  NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'cityvetcare_db'
  AND TABLE_NAME = 'notifications'
  AND INDEX_NAME IN ('idx_owner_notifications', 'idx_incident_notifications');

-- Optional: Sample query to verify data structure
SELECT 
  notification_id,
  user_id,
  owner_id,
  incident_id,
  title,
  type,
  is_read,
  created_at
FROM notifications
LIMIT 5;

-- NOTE: This migration is IDEMPOTENT
-- You can run it multiple times safely without errors
-- Existing columns and indexes will not be recreated

-- ROLLBACK (if needed):
-- Run these commands ONLY if you need to undo the migration
-- WARNING: This will remove the columns and all data in them

-- ROLLBACK Step 1: Drop indexes
-- DROP INDEX idx_owner_notifications ON notifications;
-- DROP INDEX idx_incident_notifications ON notifications;

-- ROLLBACK Step 2: Drop columns
-- ALTER TABLE notifications DROP COLUMN incident_id;
-- ALTER TABLE notifications DROP COLUMN owner_id;
