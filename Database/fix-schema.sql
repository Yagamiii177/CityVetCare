-- Fix Missing Columns and Create Stored Procedures
-- This file addresses issues found during testing

USE cityvetcare_db;

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20);

-- Note: password_hash column already exists, but some tests expect 'password'
-- We'll keep password_hash as it's more secure

-- 2. Create patrol_staff table (mentioned in missing tables)
CREATE TABLE IF NOT EXISTS patrol_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    team_id INT,
    role VARCHAR(50),
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES catcher_teams(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create patrol_schedules table (mentioned in missing tables)
CREATE TABLE IF NOT EXISTS patrol_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patrol_staff_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patrol_staff_id) REFERENCES patrol_staff(id) ON DELETE CASCADE,
    INDEX idx_patrol_staff_id (patrol_staff_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
