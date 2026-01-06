-- Migration: Add 'scheduled' status to incidents table
-- Date: 2026-01-03
-- Description: Adds 'scheduled' to the status enum in incidents table to support patrol scheduling

USE cityvetcare_db;

-- Modify the incidents table to add 'scheduled' status
ALTER TABLE incidents 
MODIFY COLUMN status ENUM('pending', 'verified', 'scheduled', 'in_progress', 'resolved', 'rejected', 'cancelled') DEFAULT 'pending';

-- Verify the change
SHOW COLUMNS FROM incidents LIKE 'status';

-- Success message
SELECT 'Migration completed: scheduled status added to incidents table' AS message;
