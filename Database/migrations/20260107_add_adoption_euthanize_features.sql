-- Migration: Add adoption and euthanize features
-- Date: 2026-01-07

USE cityvetcare_db;

-- Update stray_animals status to use ENUM with new values
ALTER TABLE stray_animals 
MODIFY COLUMN status ENUM('captured', 'adoption', 'euthanized') NOT NULL DEFAULT 'captured';

-- Create euthanized_animals history table
CREATE TABLE IF NOT EXISTS euthanized_animals (
    euthanized_id INT AUTO_INCREMENT PRIMARY KEY,
    original_animal_id INT NOT NULL,
    rfid CHAR(9),
    name VARCHAR(100),
    breed VARCHAR(100),
    species VARCHAR(50) NOT NULL,
    sex VARCHAR(20) DEFAULT 'Unknown',
    color VARCHAR(100),
    markings VARCHAR(255),
    sprayed_neutered TINYINT(1) NOT NULL DEFAULT 0,
    captured_by VARCHAR(50),
    date_captured DATE NOT NULL,
    date_euthanized DATETIME DEFAULT CURRENT_TIMESTAMP,
    location_captured VARCHAR(255) NOT NULL,
    reason TEXT,
    performed_by INT NULL,
    images JSON,
    had_owner TINYINT(1) NOT NULL DEFAULT 0,
    owner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_euthanized_admin FOREIGN KEY (performed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    INDEX idx_euthanized_date (date_euthanized),
    INDEX idx_euthanized_species (species),
    INDEX idx_euthanized_rfid (rfid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index to stray_animals status for faster filtering
ALTER TABLE stray_animals ADD INDEX idx_status (status);

-- Update adoption_request to ensure it references animals available for adoption
-- Already exists in schema, but we'll add a comment for documentation
ALTER TABLE adoption_request 
COMMENT = 'Tracks adoption requests from pet owners for stray animals with adoption status';
