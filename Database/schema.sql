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
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age INT,
    sex VARCHAR(20),
    photo TEXT,
    status VARCHAR(50),
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
    CONSTRAINT fk_report_location FOREIGN KEY (location_id) REFERENCES incident_location(location_id) ON DELETE CASCADE,
    INDEX idx_report_type (report_type),
    INDEX idx_status (status),
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
    assigned_catcher_id INT NOT NULL,
    
    -- Schedule Details
    schedule_date DATE NOT NULL,
    schedule_time TIME,
    status ENUM('Assigned', 'On Patrol', 'Completed', 'Cancelled') DEFAULT 'Assigned',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_schedule_report FOREIGN KEY (report_id) REFERENCES incident_report(report_id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_catcher FOREIGN KEY (assigned_catcher_id) REFERENCES dog_catcher(catcher_id) ON DELETE CASCADE,
    INDEX idx_schedule_report (report_id),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_schedule_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stray_animals (
    animal_id INT AUTO_INCREMENT PRIMARY KEY,
    captured_by INT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    color VARCHAR(100),
    sex VARCHAR(20) DEFAULT 'Unknown',
    marking VARCHAR(255),
    has_tag TINYINT(1) NOT NULL DEFAULT 0,
    tag_number VARCHAR(50),
    capture_date DATE NOT NULL,
    location_captured VARCHAR(255) NOT NULL,
    location_found VARCHAR(255),
    notes TEXT,
    observation_notes TEXT,
    status ENUM('captured', 'observation', 'adoption') NOT NULL DEFAULT 'captured',
    date_observed DATE,
    date_added_to_adoption DATE,
    images JSON,
    past_observations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stray_catcher FOREIGN KEY (captured_by) REFERENCES dog_catcher(catcher_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_species (species),
    INDEX idx_breed (breed),
    INDEX idx_capture_date (capture_date),
    INDEX idx_location (location_captured),
    INDEX idx_tag_number (tag_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adoption Request Table
CREATE TABLE IF NOT EXISTS adoption_request (
    adoption_id INT AUTO_INCREMENT PRIMARY KEY,
    stray_id INT NOT NULL,
    adopter_id INT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    CONSTRAINT fk_adoption_stray FOREIGN KEY (stray_id) REFERENCES stray_animals(animal_id) ON DELETE CASCADE,
    CONSTRAINT fk_adoption_adopter FOREIGN KEY (adopter_id) REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    INDEX idx_adoption_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Redemption Request Table
CREATE TABLE IF NOT EXISTS redemption_request (
    redemption_id INT AUTO_INCREMENT PRIMARY KEY,
    stray_id INT NOT NULL,
    owner_id INT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    remarks TEXT,
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
    barangay VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_number VARCHAR(20),
    email VARCHAR(150),
    head_veterinarian VARCHAR(150),
    license_number VARCHAR(100),
    services JSON,
    operating_hours JSON,
    schedule TEXT,
    documents TEXT,
    status ENUM('Active', 'Pending', 'Inactive', 'Suspended', 'Temporarily Closed') DEFAULT 'Pending',
    permit_expiry_date DATE,
    accreditation_expiry_date DATE,
    last_inspection_date DATE,
    inspection_status ENUM('Passed', 'Pending', 'Needs Follow-up') DEFAULT 'Pending',
    inspection_notes TEXT,
    last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_name (clinic_name),
    INDEX idx_clinic_status (status),
    INDEX idx_clinic_license (license_number),
    INDEX idx_clinic_email (email),
    INDEX idx_clinic_barangay (barangay),
    INDEX idx_permit_expiry (permit_expiry_date),
    INDEX idx_inspection_status (inspection_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Upgrade existing private_clinic table to support ClinicList and mapping fields
ALTER TABLE private_clinic
    ADD COLUMN IF NOT EXISTS email VARCHAR(150) AFTER contact_number,
    ADD COLUMN IF NOT EXISTS head_veterinarian VARCHAR(150) AFTER email,
    ADD COLUMN IF NOT EXISTS license_number VARCHAR(100) AFTER head_veterinarian,
    ADD COLUMN IF NOT EXISTS services JSON AFTER license_number,
    ADD COLUMN IF NOT EXISTS barangay VARCHAR(100) AFTER address,
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) AFTER barangay,
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) AFTER latitude,
    ADD COLUMN IF NOT EXISTS operating_hours JSON AFTER services,
    ADD COLUMN IF NOT EXISTS permit_expiry_date DATE AFTER status,
    ADD COLUMN IF NOT EXISTS accreditation_expiry_date DATE AFTER permit_expiry_date,
    ADD COLUMN IF NOT EXISTS last_inspection_date DATE AFTER accreditation_expiry_date,
    ADD COLUMN IF NOT EXISTS inspection_status ENUM('Passed', 'Pending', 'Needs Follow-up') DEFAULT 'Pending' AFTER last_inspection_date,
    ADD COLUMN IF NOT EXISTS inspection_notes TEXT AFTER inspection_status,
    ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER inspection_notes,
    MODIFY COLUMN status ENUM('Active', 'Pending', 'Inactive', 'Suspended', 'Temporarily Closed') DEFAULT 'Pending';
ALTER TABLE private_clinic
    ADD INDEX IF NOT EXISTS idx_clinic_license (license_number),
    ADD INDEX IF NOT EXISTS idx_clinic_email (email),
    ADD INDEX IF NOT EXISTS idx_clinic_barangay (barangay),
    ADD INDEX IF NOT EXISTS idx_permit_expiry (permit_expiry_date),
    ADD INDEX IF NOT EXISTS idx_inspection_status (inspection_status);

-- Clinic Listing Table - tracks registered clinics for ClinicList UI
CREATE TABLE IF NOT EXISTS clinic_listing (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    listed_by INT NULL,
    listing_status ENUM('Active', 'Pending', 'Inactive', 'Suspended') DEFAULT 'Pending',
    notes TEXT,
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_listing_admin FOREIGN KEY (listed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    UNIQUE INDEX uq_listing_clinic (clinic_id),
    INDEX idx_listing_status (listing_status),
    INDEX idx_listing_dates (listed_at)
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


-- Announcement Table
CREATE TABLE IF NOT EXISTS announcement (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    description TEXT,
    language VARCHAR(50) DEFAULT 'en',
    category ENUM('health', 'policy', 'events', 'general') DEFAULT 'general',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    audience ENUM('public', 'clinic', 'staff', 'partner') DEFAULT 'public',
    status ENUM('Draft', 'Scheduled', 'Published', 'Archived') DEFAULT 'Draft',
    publish_date DATETIME NULL,
    published_at DATETIME NULL,
    scheduled_for DATETIME NULL,
    is_archived TINYINT(1) DEFAULT 0,
    views INT DEFAULT 0,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_admin FOREIGN KEY (admin_id) REFERENCES administrator(admin_id) ON DELETE CASCADE,
    INDEX idx_announcement_status (status),
    INDEX idx_announcement_category (category),
    INDEX idx_announcement_priority (priority),
    INDEX idx_announcement_publish_date (publish_date),
    INDEX idx_announcement_archived (is_archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Upgrade existing announcement table with new attributes if it already exists
ALTER TABLE announcement
    MODIFY COLUMN status ENUM('Draft', 'Scheduled', 'Published', 'Archived') DEFAULT 'Draft',
    MODIFY COLUMN content LONGTEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS description TEXT AFTER content,
    ADD COLUMN IF NOT EXISTS category ENUM('health', 'policy', 'events', 'general') DEFAULT 'general' AFTER language,
    ADD COLUMN IF NOT EXISTS priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium' AFTER category,
    ADD COLUMN IF NOT EXISTS audience ENUM('public', 'clinic', 'staff', 'partner') DEFAULT 'public' AFTER priority,
    ADD COLUMN IF NOT EXISTS publish_date DATETIME NULL AFTER status,
    ADD COLUMN IF NOT EXISTS published_at DATETIME NULL AFTER publish_date,
    ADD COLUMN IF NOT EXISTS scheduled_for DATETIME NULL AFTER published_at,
    ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0 AFTER status,
    ADD COLUMN IF NOT EXISTS views INT DEFAULT 0 AFTER is_archived,
    ADD COLUMN IF NOT EXISTS date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER date_posted;

-- Announcement attachments
CREATE TABLE IF NOT EXISTS announcement_attachment (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    announcement_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT DEFAULT 0,
    file_url VARCHAR(500),
    storage_path VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_announcement FOREIGN KEY (announcement_id) REFERENCES announcement(announcement_id) ON DELETE CASCADE,
    INDEX idx_attachment_announcement (announcement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reading Materials Table
CREATE TABLE IF NOT EXISTS reading_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('book', 'website', 'digital') NOT NULL,
    category VARCHAR(100),
    author VARCHAR(150),
    description TEXT,
    content LONGTEXT,
    url VARCHAR(500),
    status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
    tags JSON,
    images JSON,
    views INT DEFAULT 0,
    date_added DATE NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_material_type (type),
    INDEX idx_material_category (category),
    INDEX idx_material_status (status),
    INDEX idx_material_date_added (date_added)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Archive History Table
CREATE TABLE IF NOT EXISTS archive_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    archived_by VARCHAR(150) NOT NULL,
    archived_date DATE NOT NULL,
    reason TEXT,
    previous_status ENUM('published', 'draft') NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_archive_material FOREIGN KEY (material_id) REFERENCES reading_materials(id) ON DELETE CASCADE,
    INDEX idx_archive_material (material_id),
    INDEX idx_archive_date (archived_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
