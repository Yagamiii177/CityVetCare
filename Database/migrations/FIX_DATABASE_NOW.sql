-- =============================================
-- Quick Fix: Apply Mobile Fields to Stored Procedures
-- Copy this entire script and run it in MySQL Workbench
-- =============================================

USE cityvetcare_db;

-- Drop existing procedures
DROP PROCEDURE IF EXISTS sp_incidents_create;
DROP PROCEDURE IF EXISTS sp_incidents_update;

-- ========================================
-- CREATE INCIDENT - Updated with mobile fields
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
    IN p_priority VARCHAR(20),
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
DELIMITER ;

-- ========================================
-- UPDATE INCIDENT - Updated with mobile fields
-- ========================================
DELIMITER //
CREATE PROCEDURE sp_incidents_update(
    IN p_id INT,
    IN p_reporter_name VARCHAR(100),
    IN p_reporter_contact VARCHAR(20),
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_incident_date DATETIME,
    IN p_priority VARCHAR(20),
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
        reporter_name = IFNULL(p_reporter_name, reporter_name),
        reporter_contact = IFNULL(p_reporter_contact, reporter_contact),
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        location = IFNULL(p_location, location),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        incident_date = IFNULL(p_incident_date, incident_date),
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
DELIMITER ;

-- Verify the procedures were created
SELECT 'SUCCESS: Stored procedures updated successfully!' as Status;
SELECT 'You can now create incident reports with all mobile fields.' as Info;
