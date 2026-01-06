-- Migration: Simplify Patrol System
-- Remove team dependency and create simple staff-based patrol scheduling

-- 1. Create Patrol Staff Table
CREATE TABLE IF NOT EXISTS patrol_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    availability ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_availability (availability),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create new Patrol Schedules Table (simplified)
CREATE TABLE IF NOT EXISTS patrol_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    assigned_staff_ids VARCHAR(255) NOT NULL COMMENT 'Comma-separated staff IDs',
    assigned_staff_names TEXT NOT NULL COMMENT 'Staff names for display',
    schedule_date DATE NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_incident (incident_id),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Update incidents table to support new statuses
ALTER TABLE incidents 
MODIFY COLUMN status ENUM('pending', 'pending_verification', 'approved', 'scheduled', 'in_progress', 'resolved', 'rejected', 'cancelled') DEFAULT 'pending';

-- 4. Insert sample patrol staff
INSERT INTO patrol_staff (name, contact, availability) VALUES
('Juan Dela Cruz', '09171234567', 'active'),
('Maria Santos', '09181234568', 'active'),
('Pedro Rodriguez', '09191234569', 'active'),
('Ana Garcia', '09201234570', 'active'),
('Carlos Reyes', '09211234571', 'active');

-- 5. Optional: Migrate existing schedules (if any) to new format
-- This creates patrol_schedules from old schedules table
INSERT INTO patrol_schedules (incident_id, assigned_staff_ids, assigned_staff_names, schedule_date, status, notes, created_at)
SELECT 
    s.incident_id,
    CAST(s.catcher_team_id AS CHAR) as assigned_staff_ids,
    ct.team_name as assigned_staff_names,
    s.scheduled_date,
    s.status,
    s.notes,
    s.created_at
FROM schedules s
LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
WHERE s.incident_id IS NOT NULL;
