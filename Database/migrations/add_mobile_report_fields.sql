-- Migration: Add mobile report management fields to incidents table
-- Date: 2026-01-03
-- Description: Add fields from mobile ReportManagement form to support detailed pet/animal reporting

USE cityvetcare_db;

-- Add new columns to incidents table
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS incident_type ENUM('incident', 'stray', 'lost') DEFAULT 'incident' COMMENT 'Type of report: incident/bite, stray animal, lost pet',
ADD COLUMN IF NOT EXISTS pet_color VARCHAR(100) COMMENT 'Color of the pet/animal',
ADD COLUMN IF NOT EXISTS pet_breed VARCHAR(100) COMMENT 'Breed of the pet/animal',
ADD COLUMN IF NOT EXISTS animal_type ENUM('dog', 'cat', 'other') COMMENT 'Type of animal',
ADD COLUMN IF NOT EXISTS pet_gender ENUM('male', 'female', 'unknown') COMMENT 'Gender of the pet/animal',
ADD COLUMN IF NOT EXISTS pet_size ENUM('small', 'medium', 'large') COMMENT 'Size of the pet/animal';

-- Add index for incident_type for faster filtering
ALTER TABLE incidents ADD INDEX idx_incident_type (incident_type);

-- Update existing records to have default incident_type if NULL
UPDATE incidents SET incident_type = 'incident' WHERE incident_type IS NULL;

-- Show updated table structure
DESCRIBE incidents;

SELECT 'Migration completed successfully - Mobile report fields added to incidents table' as Status;
