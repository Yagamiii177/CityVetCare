-- ============================================================================
-- Migration: Fix Patrol Schedule for Multiple Staff Support
-- Date: 2026-01-07
-- Description: Change assigned_catcher_id from INT to VARCHAR to support
--              storing multiple staff IDs as comma-separated values (e.g., "1,2,3")
-- ============================================================================

USE cityvetcare_db;

-- Step 1: Drop the foreign key constraint
SET @has_fk_schedule_catcher := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patrol_schedule'
    AND CONSTRAINT_NAME = 'fk_schedule_catcher'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @drop_fk_sql := IF(
  @has_fk_schedule_catcher > 0,
  'ALTER TABLE patrol_schedule DROP FOREIGN KEY fk_schedule_catcher',
  'SELECT "Skipping: fk_schedule_catcher not found" AS info'
);
PREPARE stmt_drop_fk FROM @drop_fk_sql;
EXECUTE stmt_drop_fk;
DEALLOCATE PREPARE stmt_drop_fk;

-- Step 2: Change column type from INT to VARCHAR(255)
SET @has_assigned_catcher_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patrol_schedule'
    AND COLUMN_NAME = 'assigned_catcher_id'
);

SET @modify_column_sql := IF(
  @has_assigned_catcher_id > 0,
  'ALTER TABLE patrol_schedule MODIFY COLUMN assigned_catcher_id VARCHAR(255) NOT NULL COMMENT ''Comma-separated catcher IDs for team patrols''',
  'SELECT "Skipping: assigned_catcher_id column not found" AS info'
);
PREPARE stmt_modify_col FROM @modify_column_sql;
EXECUTE stmt_modify_col;
DEALLOCATE PREPARE stmt_modify_col;

-- Step 3: Add index for better performance (cannot add FK for comma-separated values)
SET @has_idx_assigned_catchers := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patrol_schedule'
    AND INDEX_NAME = 'idx_assigned_catchers'
);

SET @add_index_sql := IF(
  @has_idx_assigned_catchers = 0,
  'ALTER TABLE patrol_schedule ADD INDEX idx_assigned_catchers (assigned_catcher_id(50))',
  'SELECT "Skipping: idx_assigned_catchers already exists" AS info'
);
PREPARE stmt_add_idx FROM @add_index_sql;
EXECUTE stmt_add_idx;
DEALLOCATE PREPARE stmt_add_idx;

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
