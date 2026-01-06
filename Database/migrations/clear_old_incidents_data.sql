-- Clear and reset incidents data for new mobile form structure
-- Date: 2026-01-03
-- Description: Remove old sample data and prepare for new reports with mobile fields

USE cityvetcare_db;

-- Clear existing incidents (this will also clear related schedules due to foreign key)
DELETE FROM schedules WHERE incident_id IS NOT NULL;
DELETE FROM incidents;

-- Reset auto-increment
ALTER TABLE incidents AUTO_INCREMENT = 1;

-- Verify the table structure has all mobile fields
DESCRIBE incidents;

SELECT 'Old data cleared successfully - Ready for new mobile-structured reports' as Status;
SELECT 'You can now submit new reports from admin or mobile with full pet information' as Message;
