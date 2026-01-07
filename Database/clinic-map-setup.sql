-- =============================================
-- CLINIC MAP DATABASE SETUP
-- Database schema for clinic mapping and monitoring
-- =============================================

USE cityvetcare_db;

-- Create table for tracking clinic map views and analytics
CREATE TABLE IF NOT EXISTS clinic_map_view (
    view_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    viewed_by INT NULL,
    view_type ENUM('map', 'list', 'detail') DEFAULT 'map',
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_map_view_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_map_view_admin FOREIGN KEY (viewed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    INDEX idx_map_view_clinic (clinic_id),
    INDEX idx_map_view_date (view_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for clinic location history (track when clinics change location)
CREATE TABLE IF NOT EXISTS clinic_location_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    old_latitude DECIMAL(10, 8),
    old_longitude DECIMAL(11, 8),
    new_latitude DECIMAL(10, 8),
    new_longitude DECIMAL(11, 8),
    old_address VARCHAR(255),
    new_address VARCHAR(255),
    old_barangay VARCHAR(100),
    new_barangay VARCHAR(100),
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    
    CONSTRAINT fk_location_history_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_location_history_admin FOREIGN KEY (changed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    INDEX idx_location_history_clinic (clinic_id),
    INDEX idx_location_history_date (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for clinic inspection reports (detailed inspection data)
CREATE TABLE IF NOT EXISTS clinic_inspection_report (
    inspection_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    inspector_id INT NOT NULL,
    inspection_date DATE NOT NULL,
    inspection_type ENUM('Initial', 'Routine', 'Follow-up', 'Complaint-based') DEFAULT 'Routine',
    
    -- Inspection Checklist
    facilities_score INT DEFAULT 0 CHECK (facilities_score BETWEEN 0 AND 100),
    equipment_score INT DEFAULT 0 CHECK (equipment_score BETWEEN 0 AND 100),
    hygiene_score INT DEFAULT 0 CHECK (hygiene_score BETWEEN 0 AND 100),
    staff_qualifications_score INT DEFAULT 0 CHECK (staff_qualifications_score BETWEEN 0 AND 100),
    record_keeping_score INT DEFAULT 0 CHECK (record_keeping_score BETWEEN 0 AND 100),
    overall_score INT DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
    
    -- Results
    inspection_result ENUM('Passed', 'Passed with Conditions', 'Failed') DEFAULT 'Passed',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Notes
    findings TEXT,
    recommendations TEXT,
    violations TEXT,
    
    -- Attachments
    photos JSON,
    documents JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_inspection_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_inspection_inspector FOREIGN KEY (inspector_id) REFERENCES administrator(admin_id) ON DELETE CASCADE,
    INDEX idx_inspection_clinic (clinic_id),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_inspection_result (inspection_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for clinic permit renewals
CREATE TABLE IF NOT EXISTS clinic_permit_renewal (
    renewal_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    permit_type ENUM('Business Permit', 'Veterinary License', 'Accreditation') NOT NULL,
    
    -- Previous Permit Info
    previous_permit_number VARCHAR(100),
    previous_expiry_date DATE,
    
    -- New Permit Info
    new_permit_number VARCHAR(100),
    new_issue_date DATE,
    new_expiry_date DATE,
    
    -- Renewal Process
    renewal_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    applied_date DATE NOT NULL,
    processed_by INT,
    processed_date DATE,
    
    -- Notes
    notes TEXT,
    rejection_reason TEXT,
    
    -- Documents
    documents JSON,
    
    CONSTRAINT fk_renewal_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_renewal_processor FOREIGN KEY (processed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    INDEX idx_renewal_clinic (clinic_id),
    INDEX idx_renewal_status (renewal_status),
    INDEX idx_renewal_expiry (new_expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for clinic complaints and reports
CREATE TABLE IF NOT EXISTS clinic_complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    complainant_name VARCHAR(150),
    complainant_contact VARCHAR(20),
    complainant_email VARCHAR(150),
    
    -- Complaint Details
    complaint_type ENUM('Service Quality', 'Misconduct', 'Facilities', 'Pricing', 'Other') NOT NULL,
    complaint_description TEXT NOT NULL,
    incident_date DATE,
    
    -- Status
    status ENUM('Pending', 'Under Investigation', 'Resolved', 'Dismissed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    
    -- Processing
    assigned_to INT,
    investigation_notes TEXT,
    resolution_notes TEXT,
    resolution_date DATE,
    
    -- Evidence
    evidence_files JSON,
    
    -- Timestamps
    filed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_complaint_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_assignee FOREIGN KEY (assigned_to) REFERENCES administrator(admin_id) ON DELETE SET NULL,
    INDEX idx_complaint_clinic (clinic_id),
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- Sample clinic with complete data for map testing
INSERT IGNORE INTO private_clinic (
    clinic_name,
    address,
    barangay,
    latitude,
    longitude,
    contact_number,
    email,
    head_veterinarian,
    license_number,
    services,
    operating_hours,
    status,
    permit_expiry_date,
    accreditation_expiry_date,
    inspection_status
) VALUES 
(
    'Manila Veterinary Clinic',
    '123 Rizal Avenue, Manila',
    'Ermita',
    14.5995,
    120.9842,
    '+63 2 1234 5678',
    'manila.vet@example.com',
    'Dr. Juan Dela Cruz',
    'VET-MNL-2024-001',
    '["Vaccination", "Surgery", "Emergency Care", "Grooming"]',
    '{"monday": "8AM-6PM", "tuesday": "8AM-6PM", "wednesday": "8AM-6PM", "thursday": "8AM-6PM", "friday": "8AM-6PM", "saturday": "8AM-12PM", "sunday": "Closed"}',
    'Active',
    DATE_ADD(CURDATE(), INTERVAL 90 DAY),
    DATE_ADD(CURDATE(), INTERVAL 180 DAY),
    'Passed'
),
(
    'Quezon City Pet Hospital',
    '456 Commonwealth Avenue, Quezon City',
    'Batasan Hills',
    14.6760,
    121.0437,
    '+63 2 9876 5432',
    'qc.pet@example.com',
    'Dr. Maria Santos',
    'VET-QC-2024-002',
    '["Pet Boarding", "Vaccination", "Laboratory", "X-Ray"]',
    '{"monday": "7AM-7PM", "tuesday": "7AM-7PM", "wednesday": "7AM-7PM", "thursday": "7AM-7PM", "friday": "7AM-7PM", "saturday": "7AM-5PM", "sunday": "9AM-12PM"}',
    'Active',
    DATE_ADD(CURDATE(), INTERVAL 120 DAY),
    DATE_ADD(CURDATE(), INTERVAL 240 DAY),
    'Passed'
),
(
    'Makati Animal Care Center',
    '789 Ayala Avenue, Makati',
    'Poblacion',
    14.5547,
    121.0244,
    '+63 2 5555 1234',
    'makati.animal@example.com',
    'Dr. Carlos Reyes',
    'VET-MKT-2024-003',
    '["Surgery", "Dental Care", "Emergency Care", "Diagnostic"]',
    '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
    'Active',
    DATE_ADD(CURDATE(), INTERVAL 15 DAY),
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    'Needs Follow-up'
);

-- Display summary
SELECT 'Clinic Map Database Setup Complete!' AS Status;
SELECT COUNT(*) AS TotalClinics FROM private_clinic;
SELECT COUNT(*) AS ActiveClinics FROM private_clinic WHERE status = 'Active';
SELECT COUNT(*) AS ClinicsWithLocation FROM private_clinic WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
