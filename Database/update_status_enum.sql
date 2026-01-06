-- Update incidents table to add 'verified' and 'rejected' status options
-- Run this to update existing database

USE cityvetcare_db;

-- Modify the status enum to include verified and rejected
ALTER TABLE incidents 
MODIFY COLUMN status ENUM('pending', 'verified', 'in_progress', 'resolved', 'rejected', 'cancelled') DEFAULT 'pending';
