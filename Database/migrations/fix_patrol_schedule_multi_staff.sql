-- ============================================================================
-- Migration: Fix Patrol Schedule for Multiple Staff Support
-- Date: 2026-01-07
-- Description: Change assigned_catcher_id from INT to VARCHAR to support
--              storing multiple staff IDs as comma-separated values (e.g., "1,2,3")
-- ============================================================================

USE cityvetcare_db;

-- Step 1: Drop the foreign key constraint
ALTER TABLE patrol_schedule 
DROP FOREIGN KEY fk_schedule_catcher;

-- Step 2: Change column type from INT to VARCHAR(255)
ALTER TABLE patrol_schedule 
MODIFY COLUMN assigned_catcher_id VARCHAR(255) NOT NULL COMMENT 'Comma-separated catcher IDs for team patrols';

-- Step 3: Add index for better performance (cannot add FK for comma-separated values)
ALTER TABLE patrol_schedule 
ADD INDEX idx_assigned_catchers (assigned_catcher_id(50));

-- Verification query
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cityvetcare_db'
  AND TABLE_NAME = 'patrol_schedule'
  AND COLUMN_NAME = 'assigned_catcher_id';

SELECT '✓ Migration complete: assigned_catcher_id is now VARCHAR(255)' AS status;
