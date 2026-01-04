-- ============================================
-- CityVetCare Complete CRUD Stored Procedures
-- Version: 2.0.0
-- Date: 2025-12-05
-- Complete CRUD operations for all entities
-- ============================================

USE cityvetcare_db;

-- ============================================
-- INCIDENTS CRUD PROCEDURES
-- ============================================

-- Get all incidents with optional filters and search
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_get_all$$
CREATE PROCEDURE sp_incidents_get_all(
    IN p_status VARCHAR(50),
    IN p_incident_type VARCHAR(50),
    IN p_search VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    IF p_limit IS NULL THEN SET p_limit = 1000; END IF;
    IF p_offset IS NULL THEN SET p_offset = 0; END IF;
    
    SELECT 
        i.*,
        ct.team_name as catcher_team_name,
        ct.leader_name as catcher_leader_name
    FROM incidents i
    LEFT JOIN catcher_teams ct ON i.assigned_catcher_id = ct.id
    WHERE (p_status IS NULL OR i.status = p_status)
    AND (p_incident_type IS NULL OR i.incident_type = p_incident_type)
    AND (p_search IS NULL OR p_search = '' OR
         i.title LIKE CONCAT('%', p_search, '%') OR
         i.description LIKE CONCAT('%', p_search, '%') OR
         i.location LIKE CONCAT('%', p_search, '%') OR
         i.reporter_name LIKE CONCAT('%', p_search, '%') OR
         ct.team_name LIKE CONCAT('%', p_search, '%'))
    ORDER BY i.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Get incident by ID
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_get_by_id$$
CREATE PROCEDURE sp_incidents_get_by_id(IN p_id INT)
BEGIN
    SELECT 
        i.*,
        ct.team_name as catcher_team_name,
        ct.leader_name as catcher_leader_name,
        ct.contact_number as catcher_contact
    FROM incidents i
    LEFT JOIN catcher_teams ct ON i.assigned_catcher_id = ct.id
    WHERE i.id = p_id;
END$$
DELIMITER ;

-- Create new incident
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_create$$
CREATE PROCEDURE sp_incidents_create(
    IN p_reporter_name VARCHAR(255),
    IN p_reporter_contact VARCHAR(50),
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_incident_date DATETIME,
    IN p_status VARCHAR(50),
    IN p_images JSON,
    IN p_assigned_catcher_id INT,
    IN p_incident_type VARCHAR(50),
    IN p_pet_color VARCHAR(100),
    IN p_pet_breed VARCHAR(100),
    IN p_animal_type VARCHAR(50),
    IN p_pet_gender VARCHAR(20),
    IN p_pet_size VARCHAR(20)
)
BEGIN
    INSERT INTO incidents (
        reporter_name, reporter_contact, title, description,
        location, latitude, longitude, incident_date,
        status, images, assigned_catcher_id, created_at,
        incident_type, pet_color, pet_breed, animal_type, pet_gender, pet_size
    ) VALUES (
        p_reporter_name, p_reporter_contact, p_title, p_description,
        p_location, p_latitude, p_longitude, COALESCE(p_incident_date, NOW()),
        COALESCE(p_status, 'pending'), p_images, 
        p_assigned_catcher_id, NOW(),
        p_incident_type, p_pet_color, p_pet_breed, p_animal_type, p_pet_gender, p_pet_size
    );
    
    SELECT LAST_INSERT_ID() as id;
END$$
DELIMITER ;

-- Update incident
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_update$$
CREATE PROCEDURE sp_incidents_update(
    IN p_id INT,
    IN p_reporter_name VARCHAR(255),
    IN p_reporter_contact VARCHAR(50),
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_incident_date DATETIME,
    IN p_status VARCHAR(50),
    IN p_images JSON,
    IN p_assigned_catcher_id INT,
    IN p_incident_type VARCHAR(50),
    IN p_pet_color VARCHAR(100),
    IN p_pet_breed VARCHAR(100),
    IN p_animal_type VARCHAR(50),
    IN p_pet_gender VARCHAR(20),
    IN p_pet_size VARCHAR(20)
)
BEGIN
    UPDATE incidents SET
        reporter_name = COALESCE(p_reporter_name, reporter_name),
        reporter_contact = COALESCE(p_reporter_contact, reporter_contact),
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        location = COALESCE(p_location, location),
        latitude = COALESCE(p_latitude, latitude),
        longitude = COALESCE(p_longitude, longitude),
        incident_date = COALESCE(p_incident_date, incident_date),
        status = COALESCE(p_status, status),
        images = COALESCE(p_images, images),
        assigned_catcher_id = COALESCE(p_assigned_catcher_id, assigned_catcher_id),
        incident_type = COALESCE(p_incident_type, incident_type),
        pet_color = COALESCE(p_pet_color, pet_color),
        pet_breed = COALESCE(p_pet_breed, pet_breed),
        animal_type = COALESCE(p_animal_type, animal_type),
        pet_gender = COALESCE(p_pet_gender, pet_gender),
        pet_size = COALESCE(p_pet_size, pet_size),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- Delete incident
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_delete$$
CREATE PROCEDURE sp_incidents_delete(IN p_id INT)
BEGIN
    DELETE FROM incidents WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- ============================================
-- CATCHER TEAMS CRUD PROCEDURES
-- ============================================

-- Get all catcher teams
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_catchers_get_all$$
CREATE PROCEDURE sp_catchers_get_all(
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    IF p_limit IS NULL THEN SET p_limit = 1000; END IF;
    IF p_offset IS NULL THEN SET p_offset = 0; END IF;
    
    SELECT * FROM catcher_teams
    WHERE (p_status IS NULL OR status = p_status)
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Get catcher team by ID
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_catchers_get_by_id$$
CREATE PROCEDURE sp_catchers_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM catcher_teams WHERE id = p_id;
END$$
DELIMITER ;

-- Create catcher team
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_catchers_create$$
CREATE PROCEDURE sp_catchers_create(
    IN p_team_name VARCHAR(255),
    IN p_leader_name VARCHAR(255),
    IN p_contact_number VARCHAR(50),
    IN p_vehicle_number VARCHAR(50),
    IN p_status VARCHAR(50),
    IN p_specialization VARCHAR(255)
)
BEGIN
    INSERT INTO catcher_teams (
        team_name, leader_name, contact_number, vehicle_number,
        status, specialization, created_at
    ) VALUES (
        p_team_name, p_leader_name, p_contact_number, p_vehicle_number,
        COALESCE(p_status, 'available'), p_specialization, NOW()
    );
    
    SELECT LAST_INSERT_ID() as id;
END$$
DELIMITER ;

-- Update catcher team
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_catchers_update$$
CREATE PROCEDURE sp_catchers_update(
    IN p_id INT,
    IN p_team_name VARCHAR(255),
    IN p_leader_name VARCHAR(255),
    IN p_contact_number VARCHAR(50),
    IN p_vehicle_number VARCHAR(50),
    IN p_status VARCHAR(50),
    IN p_specialization VARCHAR(255)
)
BEGIN
    UPDATE catcher_teams SET
        team_name = COALESCE(p_team_name, team_name),
        leader_name = COALESCE(p_leader_name, leader_name),
        contact_number = COALESCE(p_contact_number, contact_number),
        vehicle_number = COALESCE(p_vehicle_number, vehicle_number),
        status = COALESCE(p_status, status),
        specialization = COALESCE(p_specialization, specialization),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- Delete catcher team
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_catchers_delete$$
CREATE PROCEDURE sp_catchers_delete(IN p_id INT)
BEGIN
    DELETE FROM catcher_teams WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- ============================================
-- PATROL STAFF CRUD PROCEDURES
-- ============================================

-- Get all patrol staff
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_staff_get_all$$
CREATE PROCEDURE sp_patrol_staff_get_all(
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    IF p_limit IS NULL THEN SET p_limit = 1000; END IF;
    IF p_offset IS NULL THEN SET p_offset = 0; END IF;
    
    SELECT * FROM catcher_teams
    WHERE (p_status IS NULL OR status = p_status)
    ORDER BY team_name ASC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Get patrol staff by ID
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_staff_get_by_id$$
CREATE PROCEDURE sp_patrol_staff_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM catcher_teams WHERE id = p_id;
END$$
DELIMITER ;

-- Create patrol staff
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_staff_create$$
CREATE PROCEDURE sp_patrol_staff_create(
    IN p_team_name VARCHAR(255),
    IN p_leader_name VARCHAR(100),
    IN p_contact_number VARCHAR(50),
    IN p_email VARCHAR(255),
    IN p_status VARCHAR(50),
    IN p_members_count INT
)
BEGIN
    INSERT INTO catcher_teams (
        team_name, leader_name, contact_number, email, status, members_count, created_at
    ) VALUES (
        p_team_name, p_leader_name, p_contact_number, p_email,
        COALESCE(p_status, 'active'), COALESCE(p_members_count, 1), NOW()
    );
    
    SELECT LAST_INSERT_ID() as id;
END$$
DELIMITER ;

-- Update patrol staff
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_staff_update$$
CREATE PROCEDURE sp_patrol_staff_update(
    IN p_id INT,
    IN p_team_name VARCHAR(255),
    IN p_leader_name VARCHAR(100),
    IN p_contact_number VARCHAR(50),
    IN p_email VARCHAR(255),
    IN p_status VARCHAR(50),
    IN p_members_count INT
)
BEGIN
    UPDATE catcher_teams SET
        team_name = COALESCE(p_team_name, team_name),
        leader_name = COALESCE(p_leader_name, leader_name),
        contact_number = COALESCE(p_contact_number, contact_number),
        email = COALESCE(p_email, email),
        status = COALESCE(p_status, status),
        members_count = COALESCE(p_members_count, members_count),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- Delete patrol staff
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_staff_delete$$
CREATE PROCEDURE sp_patrol_staff_delete(IN p_id INT)
BEGIN
    DELETE FROM catcher_teams WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- ============================================
-- PATROL SCHEDULES CRUD PROCEDURES
-- ============================================

-- Get all patrol schedules
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_schedules_get_all$$
CREATE PROCEDURE sp_patrol_schedules_get_all(
    IN p_status VARCHAR(50),
    IN p_incident_id INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    IF p_limit IS NULL THEN SET p_limit = 1000; END IF;
    IF p_offset IS NULL THEN SET p_offset = 0; END IF;
    
    SELECT 
        s.*,
        i.title as incident_title,
        i.location as incident_location,
        ct.team_name as catcher_team_name
    FROM schedules s
    LEFT JOIN incidents i ON s.incident_id = i.id
    LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
    WHERE (p_status IS NULL OR s.status = p_status)
    AND (p_incident_id IS NULL OR s.incident_id = p_incident_id)
    ORDER BY s.scheduled_date DESC, s.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Get patrol schedule by ID
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_schedules_get_by_id$$
CREATE PROCEDURE sp_patrol_schedules_get_by_id(IN p_id INT)
BEGIN
    SELECT 
        s.*,
        i.title as incident_title,
        i.location as incident_location,
        i.status as incident_status,
        ct.team_name as catcher_team_name
    FROM schedules s
    LEFT JOIN incidents i ON s.incident_id = i.id
    LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
    WHERE s.id = p_id;
END$$
DELIMITER ;

-- Get patrol schedules by incident ID
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_schedules_get_by_incident$$
CREATE PROCEDURE sp_patrol_schedules_get_by_incident(IN p_incident_id INT)
BEGIN
    SELECT 
        s.*,
        i.title as incident_title,
        i.location as incident_location,
        ct.team_name as catcher_team_name
    FROM schedules s
    LEFT JOIN incidents i ON s.incident_id = i.id
    LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
    WHERE s.incident_id = p_incident_id
    ORDER BY s.scheduled_date DESC, s.created_at DESC;
END$$
DELIMITER ;

-- Create patrol schedule
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_schedules_create$$
CREATE PROCEDURE sp_patrol_schedules_create(
    IN p_catcher_team_id INT,
    IN p_incident_id INT,
    IN p_scheduled_date DATE,
    IN p_scheduled_time TIME,
    IN p_end_time TIME,
    IN p_status VARCHAR(50),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_schedule_id INT;
    
    START TRANSACTION;
    
    INSERT INTO schedules (
        catcher_team_id, incident_id, scheduled_date, scheduled_time,
        end_time, status, notes, created_at
    ) VALUES (
        p_catcher_team_id, p_incident_id, p_scheduled_date, p_scheduled_time,
        p_end_time, COALESCE(p_status, 'scheduled'), p_notes, NOW()
    );
    
    SET v_schedule_id = LAST_INSERT_ID();
    
    COMMIT;
    
    SELECT v_schedule_id as id;
END$$
DELIMITER ;

-- Update patrol schedule
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_schedules_update$$
CREATE PROCEDURE sp_patrol_schedules_update(
    IN p_id INT,
    IN p_catcher_team_id INT,
    IN p_incident_id INT,
    IN p_scheduled_date DATE,
    IN p_scheduled_time TIME,
    IN p_end_time TIME,
    IN p_status VARCHAR(50),
    IN p_notes TEXT
)
BEGIN
    UPDATE schedules SET
        catcher_team_id = COALESCE(p_catcher_team_id, catcher_team_id),
        incident_id = COALESCE(p_incident_id, incident_id),
        scheduled_date = COALESCE(p_scheduled_date, scheduled_date),
        scheduled_time = COALESCE(p_scheduled_time, scheduled_time),
        end_time = COALESCE(p_end_time, end_time),
        status = COALESCE(p_status, status),
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- Delete patrol schedule
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_patrol_schedules_delete$$
CREATE PROCEDURE sp_patrol_schedules_delete(IN p_id INT)
BEGIN
    DELETE FROM schedules WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- ============================================
-- DASHBOARD & ANALYTICS PROCEDURES
-- ============================================

-- Get comprehensive dashboard statistics
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_dashboard_get_stats$$
CREATE PROCEDURE sp_dashboard_get_stats()
BEGIN
    -- Incident statistics
    SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_incidents,
        SUM(CASE WHEN status = 'approved' OR status = 'verified' THEN 1 ELSE 0 END) as approved_incidents,
        SUM(CASE WHEN status = 'verified' OR status = 'approved' THEN 1 ELSE 0 END) as verified_incidents,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_incidents,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_incidents,
        SUM(CASE WHEN status = 'rejected' OR status = 'cancelled' THEN 1 ELSE 0 END) as rejected_incidents
    FROM incidents;
    
    -- Catcher teams statistics
    SELECT 
        COUNT(*) as total_teams,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as available_teams,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as on_duty_teams
    FROM catcher_teams;
    
    -- Staff statistics (using catcher teams as proxy since patrol_staff doesn't exist)
    SELECT 
        COALESCE(SUM(members_count), 0) as total_staff,
        COALESCE(SUM(CASE WHEN status = 'active' THEN members_count ELSE 0 END), 0) as active_staff
    FROM catcher_teams;
    
    -- Schedules statistics (using schedules table)
    SELECT 
        COUNT(*) as total_schedules,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_patrols,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_patrols,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_patrols
    FROM schedules;
END$$
DELIMITER ;

-- Get incident count by status
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_count_by_status$$
CREATE PROCEDURE sp_incidents_count_by_status()
BEGIN
    SELECT 
        status,
        COUNT(*) as count
    FROM incidents
    GROUP BY status
    ORDER BY count DESC;
END$$
DELIMITER ;

-- Get recent incidents (last 7 days)
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_get_recent$$
CREATE PROCEDURE sp_incidents_get_recent(IN p_days INT)
BEGIN
    IF p_days IS NULL THEN SET p_days = 7; END IF;
    
    SELECT 
        i.*,
        ct.team_name as catcher_team_name
    FROM incidents i
    LEFT JOIN catcher_teams ct ON i.assigned_catcher_team_id = ct.id
    WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL p_days DAY)
    ORDER BY i.created_at DESC;
END$$
DELIMITER ;

-- ============================================
-- BULK OPERATIONS PROCEDURES
-- ============================================

-- Bulk update incident status
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_bulk_update_status$$
CREATE PROCEDURE sp_incidents_bulk_update_status(
    IN p_incident_ids JSON,
    IN p_new_status VARCHAR(50)
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE incident_count INT;
    DECLARE current_id INT;
    
    SET incident_count = JSON_LENGTH(p_incident_ids);
    
    WHILE i < incident_count DO
        SET current_id = JSON_EXTRACT(p_incident_ids, CONCAT('$[', i, ']'));
        
        UPDATE incidents 
        SET status = p_new_status, updated_at = NOW()
        WHERE id = current_id;
        
        SET i = i + 1;
    END WHILE;
    
    SELECT incident_count as updated_count;
END$$
DELIMITER ;

-- Archive old resolved incidents
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_archive_old$$
CREATE PROCEDURE sp_incidents_archive_old(IN p_days_old INT)
BEGIN
    IF p_days_old IS NULL THEN SET p_days_old = 90; END IF;
    
    UPDATE incidents
    SET status = 'archived', updated_at = NOW()
    WHERE status = 'resolved'
    AND updated_at < DATE_SUB(NOW(), INTERVAL p_days_old DAY);
    
    SELECT ROW_COUNT() as archived_count;
END$$
DELIMITER ;

-- ============================================
-- SEARCH PROCEDURES
-- ============================================

-- Search incidents by keyword
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_incidents_search$$
CREATE PROCEDURE sp_incidents_search(
    IN p_keyword VARCHAR(255),
    IN p_limit INT
)
BEGIN
    IF p_limit IS NULL THEN SET p_limit = 50; END IF;
    
    SELECT 
        i.*,
        ct.team_name as catcher_team_name
    FROM incidents i
    LEFT JOIN catcher_teams ct ON i.assigned_catcher_team_id = ct.id
    WHERE i.title LIKE CONCAT('%', p_keyword, '%')
    OR i.description LIKE CONCAT('%', p_keyword, '%')
    OR i.location LIKE CONCAT('%', p_keyword, '%')
    OR i.reporter_name LIKE CONCAT('%', p_keyword, '%')
    ORDER BY i.created_at DESC
    LIMIT p_limit;
END$$
DELIMITER ;

-- Get available catcher teams for assignment
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_catchers_get_available$$
CREATE PROCEDURE sp_catchers_get_available()
BEGIN
    SELECT 
        ct.*,
        COUNT(i.id) as active_assignments
    FROM catcher_teams ct
    LEFT JOIN incidents i ON ct.id = i.assigned_catcher_team_id 
        AND i.status IN ('approved', 'scheduled_for_patrol', 'in_progress')
    WHERE ct.status = 'available'
    GROUP BY ct.id
    ORDER BY active_assignments ASC, ct.team_name ASC;
END$$
DELIMITER ;
