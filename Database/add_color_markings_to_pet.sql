-- Migration: Add color and markings fields to pet table
-- This allows pets to store color and marking information for better RFID autofill

ALTER TABLE pet 
ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT NULL COMMENT 'Pet color (e.g., Black, Brown, Orange/Ginger)',
ADD COLUMN IF NOT EXISTS markings VARCHAR(255) DEFAULT NULL COMMENT 'Pet markings or patterns (e.g., white patch on chest)';

-- Add index for future queries
ALTER TABLE pet ADD INDEX IF NOT EXISTS idx_pet_color (color);
