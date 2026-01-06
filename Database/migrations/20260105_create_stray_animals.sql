-- Migration: Create stray_animals table for captured/observation/adoption flows
-- Run against cityvetcare_db

CREATE TABLE IF NOT EXISTS stray_animals (
    animal_id INT AUTO_INCREMENT PRIMARY KEY,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100) DEFAULT NULL,
    sex ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown',
    marking VARCHAR(100) DEFAULT NULL,
    has_tag TINYINT(1) NOT NULL DEFAULT 0,
    tag_number VARCHAR(100) DEFAULT NULL,
    capture_date DATE NOT NULL,
    location_captured VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    observation_notes TEXT NULL,
    status ENUM('captured', 'observation', 'adoption') NOT NULL DEFAULT 'captured',
    date_observed DATE DEFAULT NULL,
    date_added_to_adoption DATE DEFAULT NULL,
    images JSON NULL,
    past_observations JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_species (species),
    INDEX idx_breed (breed),
    INDEX idx_capture_date (capture_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
