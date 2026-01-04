-- =============================================
-- Migration: Remove Priority Feature from Incident Reports
-- Date: January 4, 2026
-- Description: Drops priority column and updates all stored procedures
-- =============================================

USE cityvetcare_db;

-- Step 1: Drop the priority index first
ALTER TABLE incidents DROP INDEX idx_priority;

-- Step 2: Drop the priority column
ALTER TABLE incidents DROP COLUMN priority;

-- Step 3: Drop existing procedures
DROP PROCEDURE IF EXISTS sp_incidents_create;
DROP PROCEDURE IF EXISTS sp_incidents_update;
DROP PROCEDURE IF EXISTS sp_incidents_get_all;
DROP PROCEDURE IF EXISTS sp_incidents_get_by_id;
DROP PROCEDURE IF EXISTS sp_incidents_count_by_status;
DROP PROCEDURE IF EXISTS sp_get_dashboard_stats;
DROP PROCEDURE IF EXISTS sp_get_team_dashboard;
DROP PROCEDURE IF EXISTS sp_get_catcher_assignments;

-- ========================================
-- CREATE INCIDENT - Without priority
-- ========================================
DELIMITER //
CREATE PROCEDURE sp_incidents_create(
    IN p_reporter_name VARCHAR(100),
    IN p_reporter_contact VARCHAR(20),
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_incident_date DATETIME,
    IN p_status VARCHAR(20),
    IN p_images JSON,
    IN p_assigned_catcher_id INT,
    IN p_incident_type VARCHAR(20),
    IN p_pet_color VARCHAR(100),
    IN p_pet_breed VARCHAR(100),
    IN p_animal_type VARCHAR(20),
    IN p_pet_gender VARCHAR(20),
    IN p_pet_size VARCHAR(20)
)
BEGIN
    INSERT INTO incidents (
        reporter_name,
        reporter_contact,
        title,
        description,
        location,
        latitude,
        longitude,
        incident_date,
        status,
        images,
        assigned_catcher_id,
        incident_type,
        pet_color,
        pet_breed,
        animal_type,
        pet_gender,
        pet_size,
        created_at,
        updated_at
    ) VALUES (
        p_reporter_name,
        p_reporter_contact,
        p_title,
        p_description,
        p_location,
        p_latitude,
        p_longitude,
        IFNULL(p_incident_date, NOW()),
        IFNULL(p_status, 'pending'),
        p_images,
        p_assigned_catcher_id,
        IFNULL(p_incident_type, 'incident'),
        p_pet_color,
        p_pet_breed,
        p_animal_type,
        p_pet_gender,
        p_pet_size,
        NOW(),
        NOW()
    );
    
    SELECT LAST_INSERT_ID() as id;
END //

-- ========================================
-- UPDATE INCIDENT - Without priority
-- ========================================
CREATE PROCEDURE sp_incidents_update(
    IN p_id INT,
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_status VARCHAR(20),
    IN p_images JSON,
    IN p_assigned_catcher_id INT,
    IN p_incident_type VARCHAR(20),
    IN p_pet_color VARCHAR(100),
    IN p_pet_breed VARCHAR(100),
    IN p_animal_type VARCHAR(20),
    IN p_pet_gender VARCHAR(20),
    IN p_pet_size VARCHAR(20)
)
BEGIN
    UPDATE incidents
    SET
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        location = IFNULL(p_location, location),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        status = IFNULL(p_status, status),
        images = IFNULL(p_images, images),
        assigned_catcher_id = IFNULL(p_assigned_catcher_id, assigned_catcher_id),
        incident_type = IFNULL(p_incident_type, incident_type),
        pet_color = IFNULL(p_pet_color, pet_color),
        pet_breed = IFNULL(p_pet_breed, pet_breed),
        animal_type = IFNULL(p_animal_type, animal_type),
        pet_gender = IFNULL(p_pet_gender, pet_gender),
        pet_size = IFNULL(p_pet_size, pet_size),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //

-- ========================================
-- GET ALL INCIDENTS - Without priority
-- ========================================
CREATE PROCEDURE sp_incidents_get_all(
    IN p_status VARCHAR(20),
    IN p_incident_type VARCHAR(20),
    IN p_search VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SET @sql = 'SELECT * FROM incidents WHERE 1=1';
    
    IF p_status IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND status = ''', p_status, '''');
    END IF;
    
    IF p_incident_type IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND incident_type = ''', p_incident_type, '''');
    END IF;
    
    IF p_search IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND (title LIKE ''%', p_search, '%'' OR description LIKE ''%', p_search, '%'' OR location LIKE ''%', p_search, '%'')');
    END IF;
    
    SET @sql = CONCAT(@sql, ' ORDER BY created_at DESC');
    
    IF p_limit IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' LIMIT ', p_limit);
    END IF;
    
    IF p_offset IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' OFFSET ', p_offset);
    END IF;
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

-- ========================================
-- GET INCIDENT BY ID - Without priority
-- ========================================
CREATE PROCEDURE sp_incidents_get_by_id(
    IN p_id INT
)
BEGIN
    SELECT * FROM incidents WHERE id = p_id;
END //

-- ========================================
-- COUNT BY STATUS - Without priority
-- ========================================
CREATE PROCEDURE sp_incidents_count_by_status()
BEGIN
    SELECT 
        status,
        COUNT(*) as count
    FROM incidents
    GROUP BY status;
END //

-- ========================================
-- DASHBOARD STATS - Without priority counts
-- ========================================
CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
    SELECT
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM incidents;
END //

-- ========================================
-- TEAM DASHBOARD - Without priority
-- ========================================
CREATE PROCEDURE sp_get_team_dashboard()
BEGIN
    SELECT 
        ct.id as team_id,
        ct.team_name,
        ct.leader_name,
        ct.contact_number,
        ct.status as team_status,
        COUNT(i.id) as total_incidents,
        SUM(CASE WHEN i.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN i.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) as resolved
    FROM catcher_teams ct
    LEFT JOIN incidents i ON ct.id = i.assigned_catcher_id
    GROUP BY ct.id, ct.team_name, ct.leader_name, ct.contact_number, ct.status;
END //

-- ========================================
-- CATCHER ASSIGNMENTS - Without priority
-- ========================================
CREATE PROCEDURE sp_get_catcher_assignments(
    IN p_catcher_id INT
)
BEGIN
    SELECT 
        i.id as incident_id,
        i.title as incident_title,
        i.description as incident_description,
        i.location as incident_location,
        i.status as incident_status,
        i.incident_date,
        i.created_at,
        ct.team_name as catcher_team_name
    FROM incidents i
    LEFT JOIN catcher_teams ct ON i.assigned_catcher_id = ct.id
    WHERE i.assigned_catcher_id = p_catcher_id
    ORDER BY i.created_at DESC;
END //

DELIMITER ;

-- Verification: Show the updated incidents table structure
DESCRIBE incidents;

-- Show count of all incidents to ensure data integrity
SELECT COUNT(*) as total_incidents FROM incidents;

-- Show sample of incidents to verify priority column is removed
SELECT id, title, status, incident_type, created_at FROM incidents LIMIT 5;
