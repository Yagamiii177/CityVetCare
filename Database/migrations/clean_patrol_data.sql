-- ============================================================================
-- Clean Patrol Schedule Data (Keep Catcher Data)
-- Date: 2026-01-07
-- Description: Remove all patrol schedule records and test incident data
--              while preserving dog_catcher (animal catcher staff) records
-- ============================================================================

USE cityvetcare_db;

-- Show current counts before deletion
SELECT 'BEFORE CLEANUP:' AS status;
SELECT 'Patrol Schedules' AS table_name, COUNT(*) AS record_count FROM patrol_schedule
UNION ALL
SELECT 'Dog Catchers' AS table_name, COUNT(*) AS record_count FROM dog_catcher;

-- Delete all patrol schedule records
DELETE FROM patrol_schedule;

-- Optional: Reset auto-increment counter for patrol_schedule
ALTER TABLE patrol_schedule AUTO_INCREMENT = 1;

-- Show counts after deletion
SELECT 'AFTER CLEANUP:' AS status;
SELECT 'Patrol Schedules' AS table_name, COUNT(*) AS record_count FROM patrol_schedule
UNION ALL
SELECT 'Dog Catchers' AS table_name, COUNT(*) AS record_count FROM dog_catcher;

-- Verify dog_catcher data is intact
SELECT 
    catcher_id,
    full_name,
    contact_number,
    date_created,
    date_updated
FROM dog_catcher
ORDER BY catcher_id;

SELECT '✓ Cleanup complete: All patrol schedules deleted, dog catcher data preserved' AS status;
