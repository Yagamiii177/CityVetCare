-- CityVetCare Database Schema
-- MySQL Database for CityVetCare Application

-- Create Database
CREATE DATABASE IF NOT EXISTS cityvetcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cityvetcare_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'catcher', 'veterinarian') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catcher Teams Table
CREATE TABLE IF NOT EXISTS catcher_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    members_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_team_name (team_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('pending', 'in_progress', 'resolved', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    reporter_name VARCHAR(100),
    reporter_contact VARCHAR(20),
    incident_date DATETIME NOT NULL,
    images JSON,
    assigned_catcher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_catcher_id) REFERENCES catcher_teams(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_incident_date (incident_date),
    INDEX idx_assigned_catcher (assigned_catcher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    catcher_team_id INT NOT NULL,
    incident_id INT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    end_time TIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (catcher_team_id) REFERENCES catcher_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status),
    INDEX idx_catcher_team (catcher_team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stray Animals Table
CREATE TABLE IF NOT EXISTS stray_animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_type ENUM('dog', 'cat', 'other') NOT NULL,
    breed VARCHAR(100),
    age_estimate VARCHAR(50),
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    color VARCHAR(100),
    size ENUM('small', 'medium', 'large', 'extra_large') DEFAULT 'medium',
    health_status ENUM('healthy', 'injured', 'sick', 'critical') DEFAULT 'healthy',
    capture_location VARCHAR(255),
    capture_date DATETIME,
    captured_by INT,
    status ENUM('captured', 'sheltered', 'adopted', 'deceased', 'released') DEFAULT 'captured',
    images JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (captured_by) REFERENCES catcher_teams(id) ON DELETE SET NULL,
    INDEX idx_animal_type (animal_type),
    INDEX idx_status (status),
    INDEX idx_capture_date (capture_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adoptions Table
CREATE TABLE IF NOT EXISTS adoptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    adopter_name VARCHAR(100) NOT NULL,
    adopter_contact VARCHAR(20) NOT NULL,
    adopter_email VARCHAR(100),
    adopter_address TEXT,
    adoption_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES stray_animals(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_adoption_date (adoption_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vaccinations Table
CREATE TABLE IF NOT EXISTS vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_type VARCHAR(100),
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    administered_by VARCHAR(100),
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES stray_animals(id) ON DELETE CASCADE,
    INDEX idx_vaccination_date (vaccination_date),
    INDEX idx_next_due_date (next_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type ENUM('vaccination', 'spay_neuter', 'awareness', 'rescue', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    location VARCHAR(255),
    status ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
    target_count INT DEFAULT 0,
    actual_count INT DEFAULT 0,
    budget DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_campaign_type (campaign_type),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Data

-- Sample Admin User (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@cityvetcare.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample Catcher Teams
INSERT INTO catcher_teams (team_name, leader_name, contact_number, email, status, members_count) VALUES
('Alpha Team', 'John Doe', '09171234567', 'alpha@cityvetcare.com', 'active', 5),
('Bravo Team', 'Jane Smith', '09181234567', 'bravo@cityvetcare.com', 'active', 4),
('Charlie Team', 'Mike Johnson', '09191234567', 'charlie@cityvetcare.com', 'active', 3);

-- Sample Incidents
INSERT INTO incidents (title, description, location, latitude, longitude, status, priority, reporter_name, reporter_contact, incident_date, assigned_catcher_id) VALUES
('Stray dog near school', 'Large dog wandering near elementary school gates', 'Main Street Elementary School', 14.5995, 120.9842, 'pending', 'high', 'Maria Cruz', '09171111111', NOW(), 1),
('Injured cat found', 'Cat with visible injuries found in parking lot', 'SM City Parking Area', 14.5501, 121.0489, 'in_progress', 'urgent', 'Pedro Santos', '09182222222', NOW(), 2),
('Multiple dogs reported', 'Pack of 3-4 dogs in residential area', 'Barangay San Jose', 14.6091, 121.0223, 'pending', 'medium', 'Anonymous', '', NOW(), NULL);

-- Sample Schedules
INSERT INTO schedules (catcher_team_id, incident_id, scheduled_date, scheduled_time, end_time, status, notes) VALUES
(1, 1, CURDATE(), '09:00:00', '11:00:00', 'scheduled', 'Check school hours before arrival'),
(2, 2, CURDATE(), '14:00:00', '16:00:00', 'in_progress', 'Bring medical supplies'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00', 'scheduled', 'Multiple animals - need backup');
