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

-- Incident Reports Table
CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    status ENUM('pending', 'verified', 'in_progress', 'assigned', 'scheduled', 'resolved', 'cancelled') DEFAULT 'pending',
    incident_type ENUM('incident', 'stray', 'lost') DEFAULT 'incident',
    animal_type ENUM('dog', 'cat', 'other') NULL,
    pet_breed VARCHAR(100) NULL,
    pet_color VARCHAR(100) NULL,
    pet_gender ENUM('male', 'female', 'unknown') NULL,
    pet_size ENUM('small', 'medium', 'large') NULL,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_contact VARCHAR(20) NOT NULL,
    reporter_address VARCHAR(500) NULL,
    assigned_catcher_id INT NULL,
    assigned_staff_name VARCHAR(100) NULL,
    images JSON NULL,
    incident_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_incident_type (incident_type),
    INDEX idx_location (location(255)),
    INDEX idx_created_at (created_at),
    INDEX idx_status_type (status, incident_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catcher Teams Table
CREATE TABLE IF NOT EXISTS catcher_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    status ENUM('available', 'on_duty', 'off_duty') DEFAULT 'available',
    specialization VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    catcher_team_id INT NULL,
    assigned_staff_name VARCHAR(100) NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    location VARCHAR(500) NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (catcher_team_id) REFERENCES catcher_teams(id) ON DELETE SET NULL,
    INDEX idx_incident_id (incident_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample catcher teams
INSERT INTO catcher_teams (team_name, leader_name, contact_number, status, specialization) VALUES
('Team Alpha', 'Carlos Rodriguez', '09171234567', 'available', 'Large dogs'),
('Team Bravo', 'Maria Santos', '09181234567', 'available', 'Cats and small animals'),
('Team Charlie', 'Jose Cruz', '09191234567', 'available', 'Aggressive animals') 
ON DUPLICATE KEY UPDATE team_name=team_name;
