-- CityVetCare Database Schema
-- MySQL Database for CityVetCare Application

-- Create Database
CREATE DATABASE IF NOT EXISTS cityvetcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cityvetcare_db;

-- Administrator Table
CREATE TABLE IF NOT EXISTS administrator (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('veterinarian', 'staff') NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pet Owner Table
CREATE TABLE IF NOT EXISTS pet_owner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    pet_count INT NOT NULL DEFAULT 0,
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_contact_number (contact_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dog Catcher Table
CREATE TABLE IF NOT EXISTS dog_catcher (
    catcher_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catcher_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pet Table
CREATE TABLE IF NOT EXISTS pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    rfid CHAR(9),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age INT,
    sex VARCHAR(20),
    color VARCHAR(100),
    markings VARCHAR(255),
    photo TEXT,
    status VARCHAR(50),
    capture_count INT NOT NULL DEFAULT 0,
    redemption_count INT NOT NULL DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet_owner FOREIGN KEY (owner_id) REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    INDEX idx_pet_owner (owner_id),
    INDEX idx_pet_species (species)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INCIDENT REPORT MANAGEMENT SYSTEM
-- Normalized schema for Web and Mobile reporting
-- =============================================

-- Reporter Table - Store citizen information
CREATE TABLE IF NOT EXISTS reporter (
    reporter_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    contact_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_number (contact_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident Location Table - For map-based reporting
CREATE TABLE IF NOT EXISTS incident_location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    address_text VARCHAR(255),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident Report Table - Core report data
CREATE TABLE IF NOT EXISTS incident_report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    owner_id INT NULL COMMENT 'Pet owner who submitted the report (NULL for anonymous emergency reports)',
    location_id INT NOT NULL,
    
    -- Report Classification
    report_type ENUM('bite', 'stray', 'lost') NOT NULL,
    description TEXT,
    incident_date DATETIME NOT NULL,
    status ENUM('Pending', 'Verified', 'Scheduled', 'In Progress', 'Resolved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Timestamps
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES reporter(reporter_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_owner FOREIGN KEY (owner_id) REFERENCES pet_owner(owner_id) ON DELETE SET NULL,
    CONSTRAINT fk_report_location FOREIGN KEY (location_id) REFERENCES incident_location(location_id) ON DELETE CASCADE,
    INDEX idx_report_type (report_type),
    INDEX idx_status (status),
    INDEX idx_owner_id (owner_id),
    INDEX idx_incident_date (incident_date),
    INDEX idx_reported_at (reported_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident Pet Table - Animal information linked to incident reports
CREATE TABLE IF NOT EXISTS incident_pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    
    -- Pet Information
    animal_type ENUM('Dog', 'Cat', 'Other') NOT NULL,
    pet_color VARCHAR(100),
    pet_breed VARCHAR(100),
    pet_gender ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown',
    pet_size ENUM('Small', 'Medium', 'Large') DEFAULT 'Medium',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_incident_pet_report FOREIGN KEY (report_id) REFERENCES incident_report(report_id) ON DELETE CASCADE,
    INDEX idx_incident_pet_report (report_id),
    INDEX idx_incident_animal_type (animal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Report Images Table - Evidence uploads
CREATE TABLE IF NOT EXISTS report_image (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_image_report FOREIGN KEY (report_id) REFERENCES incident_report(report_id) ON DELETE CASCADE,
    INDEX idx_image_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident Assessment Table - Admin-only evaluation
CREATE TABLE IF NOT EXISTS incident_assessment (
    assessment_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    assessed_by INT NOT NULL,
    
    -- Assessment Details
    severity_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    injuries_description TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_assessment_report FOREIGN KEY (report_id) REFERENCES incident_report(report_id) ON DELETE CASCADE,
    CONSTRAINT fk_assessment_admin FOREIGN KEY (assessed_by) REFERENCES administrator(admin_id) ON DELETE CASCADE,
    INDEX idx_assessment_report (report_id),
    INDEX idx_severity (severity_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patrol Schedule Table - Scheduling support
CREATE TABLE IF NOT EXISTS patrol_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    assigned_catcher_id VARCHAR(255) NOT NULL COMMENT 'Comma-separated catcher IDs for team patrols',
    
    -- Schedule Details
    schedule_date DATE NOT NULL,
    schedule_time TIME,
    status ENUM('Assigned', 'On Patrol', 'Completed', 'Cancelled') DEFAULT 'Assigned',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_schedule_report FOREIGN KEY (report_id) REFERENCES incident_report(report_id) ON DELETE CASCADE,
    INDEX idx_schedule_report (report_id),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_schedule_status (status),
    INDEX idx_assigned_catchers (assigned_catcher_id(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
-- Used by backend for authenticated notifications (pet owners/admin/catchers)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('owner', 'admin', 'catcher') NOT NULL DEFAULT 'owner',
    owner_id INT NULL COMMENT 'FK to pet_owner.owner_id for authenticated pet owners',
    incident_id INT NULL COMMENT 'FK to incident_report.report_id',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    stray_animal_id INT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_notifications (user_id, user_type),
    INDEX idx_notification_read (is_read),
    INDEX idx_stray_notification (stray_animal_id),
    INDEX idx_owner_notifications (owner_id),
    INDEX idx_incident_notifications (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stray Animals Table
CREATE TABLE IF NOT EXISTS stray_animals (
    animal_id INT AUTO_INCREMENT PRIMARY KEY,
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
    registration_date DATE NOT NULL,
    location_captured VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    status ENUM('captured', 'adoption', 'adopted', 'euthanized', 'claimed') NOT NULL DEFAULT 'captured',
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rfid (rfid),
    INDEX idx_species (species),
    INDEX idx_breed (breed),
    INDEX idx_date_captured (date_captured),
    INDEX idx_location (location_captured),
    INDEX idx_stray_coords (latitude, longitude),
    INDEX idx_captured_by (captured_by),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Euthanized Animals Table (Historical records)
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

-- Adoption Request Table
CREATE TABLE IF NOT EXISTS adoption_request (
    adoption_id INT AUTO_INCREMENT PRIMARY KEY,
    stray_id INT NOT NULL,
    adopter_id INT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    applicant_details JSON NULL,
    CONSTRAINT fk_adoption_stray FOREIGN KEY (stray_id) REFERENCES stray_animals(animal_id) ON DELETE CASCADE,
    CONSTRAINT fk_adoption_adopter FOREIGN KEY (adopter_id) REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    INDEX idx_adoption_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks adoption requests from pet owners for stray animals with adoption status';

-- Redemption Request Table
CREATE TABLE IF NOT EXISTS redemption_request (
    redemption_id INT AUTO_INCREMENT PRIMARY KEY,
    stray_id INT NOT NULL,
    owner_id INT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    remarks TEXT,
    owner_contact VARCHAR(50) NULL,
    proof_images TEXT NULL,
    attempt_count INT DEFAULT 0,
    CONSTRAINT fk_redemption_stray FOREIGN KEY (stray_id) REFERENCES stray_animals(animal_id) ON DELETE CASCADE,
    CONSTRAINT fk_redemption_owner FOREIGN KEY (owner_id) REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    INDEX idx_redemption_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Private Clinic Table
CREATE TABLE IF NOT EXISTS private_clinic (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    contact_number VARCHAR(20),
    schedule TEXT,
    documents TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_name (clinic_name),
    INDEX idx_clinic_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vaccination Record Table
CREATE TABLE IF NOT EXISTS vaccination_record (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    clinic_id INT NULL,
    vaccine_type VARCHAR(100) NOT NULL,
    date_administered DATE NOT NULL,
    next_due_date DATE,
    source VARCHAR(50),
    CONSTRAINT fk_vaccination_pet FOREIGN KEY (pet_id) REFERENCES pet(pet_id) ON DELETE CASCADE,
    CONSTRAINT fk_vaccination_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE SET NULL,
    INDEX idx_vaccination_pet (pet_id),
    INDEX idx_vaccination_type (vaccine_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clinic Vaccination Submission Table
CREATE TABLE IF NOT EXISTS clinic_vaccination_submission (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    owner_name VARCHAR(150),
    pet_name VARCHAR(150),
    species VARCHAR(50),
    vaccine_type VARCHAR(100),
    date_administered DATE,
    proof_photo TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    verified_by INT NULL,
    CONSTRAINT fk_submission_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_admin FOREIGN KEY (verified_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    INDEX idx_submission_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcement Table
CREATE TABLE IF NOT EXISTS announcement (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'en',
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    CONSTRAINT fk_announcement_admin FOREIGN KEY (admin_id) REFERENCES administrator(admin_id) ON DELETE CASCADE,
    INDEX idx_announcement_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;