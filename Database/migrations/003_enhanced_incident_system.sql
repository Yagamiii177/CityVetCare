-- Enhanced Database Schema for Incident Reporting and Monitoring System
-- Adds support for verification, audit trail, notifications, and patrol outcomes

USE cityvetcare_db;

-- Add new columns to incidents table for enhanced reporting
ALTER TABLE incidents 
  MODIFY COLUMN status ENUM(
    'PENDING_VERIFICATION',
    'pending', 
    'verified', 
    'rejected',
    'in_progress', 
    'resolved', 
    'cancelled'
  ) DEFAULT 'PENDING_VERIFICATION',
  ADD COLUMN incident_type ENUM('bite', 'stray', 'injured', 'aggressive', 'other') DEFAULT 'stray' AFTER priority,
  ADD COLUMN reporter_id INT DEFAULT NULL AFTER reporter_contact,
  ADD COLUMN verified_by INT DEFAULT NULL AFTER assigned_catcher_id,
  ADD COLUMN verified_at DATETIME DEFAULT NULL AFTER verified_by,
  ADD COLUMN verification_notes TEXT DEFAULT NULL AFTER verified_at,
  ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER verification_notes,
  ADD COLUMN is_offline_sync BOOLEAN DEFAULT FALSE AFTER images,
  ADD COLUMN synced_at DATETIME DEFAULT NULL AFTER is_offline_sync,
  ADD FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Audit Log Table for tracking all changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('incident', 'patrol', 'user', 'schedule', 'verification') NOT NULL,
    entity_id INT NOT NULL,
    action ENUM('create', 'update', 'delete', 'verify', 'reject', 'assign', 'complete') NOT NULL,
    performed_by INT NOT NULL,
    old_value JSON DEFAULT NULL,
    new_value JSON DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_action (action),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM(
      'report_submitted',
      'report_verified',
      'report_rejected',
      'patrol_assigned',
      'patrol_completed',
      'patrol_updated',
      'system_alert'
    ) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type ENUM('incident', 'patrol', 'schedule', 'user') DEFAULT NULL,
    related_entity_id INT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_pushed BOOLEAN DEFAULT FALSE,
    push_sent_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patrol Staff Table (Individual Animal Catchers)
CREATE TABLE IF NOT EXISTS patrol_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT DEFAULT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_id INT DEFAULT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    availability_status ENUM('available', 'on_patrol', 'off_duty', 'on_leave') DEFAULT 'available',
    specialization VARCHAR(255) DEFAULT NULL,
    experience_years INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES catcher_teams(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_team_id (team_id),
    INDEX idx_availability (availability_status),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Schedules table for patrol management
ALTER TABLE schedules
  ADD COLUMN patrol_staff_id INT DEFAULT NULL AFTER catcher_team_id,
  ADD COLUMN patrol_outcome ENUM(
    'captured',
    'not_found',
    'rescheduled',
    'cancelled',
    'in_progress',
    'pending'
  ) DEFAULT 'pending' AFTER status,
  ADD COLUMN outcome_notes TEXT DEFAULT NULL AFTER patrol_outcome,
  ADD COLUMN completed_at DATETIME DEFAULT NULL AFTER outcome_notes,
  ADD COLUMN assigned_by INT DEFAULT NULL AFTER notes,
  ADD FOREIGN KEY (patrol_staff_id) REFERENCES patrol_staff(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

-- Offline Sync Queue Table
CREATE TABLE IF NOT EXISTS sync_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entity_type ENUM('incident', 'patrol_update', 'image_upload') NOT NULL,
    operation ENUM('create', 'update', 'delete') NOT NULL,
    data JSON NOT NULL,
    sync_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_sync_status (sync_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh Token Table for JWT management
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for patrol staff
INSERT INTO patrol_staff (team_id, first_name, last_name, phone_number, email, availability_status, specialization, experience_years)
VALUES
  (1, 'Carlos', 'Rodriguez', '09171234567', 'carlos.r@cityvet.com', 'available', 'Large dogs', 5),
  (1, 'Maria', 'Santos', '09181234567', 'maria.s@cityvet.com', 'available', 'Cats and small animals', 3),
  (2, 'Jose', 'Cruz', '09191234567', 'jose.c@cityvet.com', 'on_patrol', 'Aggressive animals', 7),
  (2, 'Ana', 'Reyes', '09201234567', 'ana.r@cityvet.com', 'available', 'Wildlife', 4),
  (3, 'Roberto', 'Garcia', '09211234567', 'roberto.g@cityvet.com', 'available', 'General', 2);

-- Create sample veterinarian and catcher users
INSERT INTO users (username, email, password_hash, role) VALUES
  ('vet_juan', 'vet.juan@cityvet.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'veterinarian'),
  ('catcher_carlos', 'catcher.carlos@cityvet.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'catcher'),
  ('citizen_maria', 'maria.citizen@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Update patrol staff to link with user accounts
UPDATE patrol_staff SET user_id = (SELECT id FROM users WHERE username = 'catcher_carlos') WHERE id = 1;

-- Add indexes for performance
CREATE INDEX idx_incident_status_type ON incidents(status, incident_type);
CREATE INDEX idx_schedule_status_outcome ON schedules(status, patrol_outcome);
CREATE INDEX idx_notification_user_read ON notifications(user_id, is_read);
