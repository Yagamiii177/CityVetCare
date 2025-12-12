-- ============================================
-- CityVetCare Stored Procedures Migration
-- Version: 1.0.0
-- Date: 2025-12-05
-- ============================================

USE cityvetcare_db;

-- ============================================
-- 1. Get Incident Statistics
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_incident_statistics$$

CREATE PROCEDURE sp_get_incident_statistics()
BEGIN
    SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_priority
    FROM incidents;
END$$

DELIMITER ;

-- ============================================
-- 2. Get Active Patrol Schedules
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_active_patrol_schedules$$

CREATE PROCEDURE sp_get_active_patrol_schedules()
BEGIN
    SELECT 
        ps.*,
        i.title as incident_title,
        i.location as incident_location,
        i.priority as incident_priority,
        i.status as incident_status
    FROM patrol_schedules ps
    LEFT JOIN incidents i ON ps.incident_id = i.id
    WHERE ps.status IN ('scheduled', 'in_progress')
    AND ps.schedule_date >= CURDATE()
    ORDER BY ps.schedule_date ASC, ps.created_at DESC;
END$$

DELIMITER ;

-- ============================================
-- 3. Assign Patrol Staff to Incident
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_assign_patrol_to_incident$$

CREATE PROCEDURE sp_assign_patrol_to_incident(
    IN p_incident_id INT,
    IN p_staff_ids JSON,
    IN p_schedule_date DATETIME,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_schedule_id INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Create patrol schedule
    INSERT INTO patrol_schedules (
        incident_id, 
        assigned_staff_ids, 
        schedule_date, 
        status, 
        notes
    ) VALUES (
        p_incident_id,
        p_staff_ids,
        p_schedule_date,
        'scheduled',
        p_notes
    );
    
    SET v_schedule_id = LAST_INSERT_ID();
    
    -- Update incident status to scheduled_for_patrol
    UPDATE incidents 
    SET status = 'scheduled_for_patrol'
    WHERE id = p_incident_id;
    
    -- Commit transaction
    COMMIT;
    
    -- Return the created schedule
    SELECT * FROM patrol_schedules WHERE id = v_schedule_id;
END$$

DELIMITER ;

-- ============================================
-- 4. Complete Patrol Schedule
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_complete_patrol_schedule$$

CREATE PROCEDURE sp_complete_patrol_schedule(
    IN p_schedule_id INT,
    IN p_completion_notes TEXT
)
BEGIN
    DECLARE v_incident_id INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Get incident ID
    SELECT incident_id INTO v_incident_id
    FROM patrol_schedules
    WHERE id = p_schedule_id;
    
    -- Update schedule status
    UPDATE patrol_schedules
    SET status = 'completed',
        notes = CONCAT(IFNULL(notes, ''), '\n\nCompletion Notes: ', p_completion_notes)
    WHERE id = p_schedule_id;
    
    -- Update incident status to resolved
    UPDATE incidents
    SET status = 'resolved'
    WHERE id = v_incident_id;
    
    -- Commit transaction
    COMMIT;
    
    SELECT 'Patrol schedule completed successfully' as message;
END$$

DELIMITER ;

-- ============================================
-- 5. Get Incidents by Date Range
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_incidents_by_date_range$$

CREATE PROCEDURE sp_get_incidents_by_date_range(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        i.*,
        c.team_name as catcher_team_name,
        c.leader_name as catcher_leader
    FROM incidents i
    LEFT JOIN catcher_teams c ON i.assigned_catcher_id = c.id
    WHERE DATE(i.incident_date) BETWEEN p_start_date AND p_end_date
    ORDER BY i.incident_date DESC;
END$$

DELIMITER ;

-- ============================================
-- 6. Get Patrol Staff Availability
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_available_patrol_staff$$

CREATE PROCEDURE sp_get_available_patrol_staff(
    IN p_date DATE
)
BEGIN
    -- Get staff who are not already scheduled for the given date
    SELECT ps.*
    FROM patrol_staff ps
    WHERE ps.availability = 'active'
    AND ps.id NOT IN (
        SELECT JSON_EXTRACT(assigned_staff_ids, '$[*]')
        FROM patrol_schedules
        WHERE DATE(schedule_date) = p_date
        AND status IN ('scheduled', 'in_progress')
    )
    ORDER BY ps.name ASC;
END$$

DELIMITER ;

-- ============================================
-- 7. Get Monthly Incident Report
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_monthly_incident_report$$

CREATE PROCEDURE sp_get_monthly_incident_report(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        DATE(incident_date) as incident_day,
        COUNT(*) as incident_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN priority = 'urgent' OR priority = 'high' THEN 1 ELSE 0 END) as high_priority_count
    FROM incidents
    WHERE YEAR(incident_date) = p_year
    AND MONTH(incident_date) = p_month
    GROUP BY DATE(incident_date)
    ORDER BY incident_day ASC;
END$$

DELIMITER ;

-- ============================================
-- 8. Bulk Update Incident Status
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_bulk_update_incident_status$$

CREATE PROCEDURE sp_bulk_update_incident_status(
    IN p_incident_ids JSON,
    IN p_new_status VARCHAR(50)
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_incident_id INT;
    
    SET v_count = JSON_LENGTH(p_incident_ids);
    
    START TRANSACTION;
    
    WHILE i < v_count DO
        SET v_incident_id = JSON_EXTRACT(p_incident_ids, CONCAT('$[', i, ']'));
        
        UPDATE incidents
        SET status = p_new_status
        WHERE id = v_incident_id;
        
        SET i = i + 1;
    END WHILE;
    
    COMMIT;
    
    SELECT CONCAT(v_count, ' incidents updated to status: ', p_new_status) as message;
END$$

DELIMITER ;

-- ============================================
-- 9. Get Catcher Team Performance
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_catcher_team_performance$$

CREATE PROCEDURE sp_get_catcher_team_performance(
    IN p_team_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        ct.team_name,
        ct.leader_name,
        COUNT(i.id) as total_assignments,
        SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN i.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        ROUND(SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) * 100.0 / COUNT(i.id), 2) as success_rate
    FROM catcher_teams ct
    LEFT JOIN incidents i ON ct.id = i.assigned_catcher_id
    WHERE ct.id = p_team_id
    AND i.incident_date BETWEEN p_start_date AND p_end_date
    GROUP BY ct.id, ct.team_name, ct.leader_name;
END$$

DELIMITER ;

-- ============================================
-- 10. Archive Old Incidents
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_archive_old_incidents$$

CREATE PROCEDURE sp_archive_old_incidents(
    IN p_days_old INT
)
BEGIN
    DECLARE v_archive_date DATE;
    DECLARE v_affected_rows INT;
    
    SET v_archive_date = DATE_SUB(CURDATE(), INTERVAL p_days_old DAY);
    
    -- Create archive table if not exists
    CREATE TABLE IF NOT EXISTS incidents_archive LIKE incidents;
    
    START TRANSACTION;
    
    -- Copy old resolved incidents to archive
    INSERT INTO incidents_archive
    SELECT * FROM incidents
    WHERE status = 'resolved'
    AND DATE(updated_at) < v_archive_date;
    
    SET v_affected_rows = ROW_COUNT();
    
    -- Delete archived incidents from main table
    DELETE FROM incidents
    WHERE status = 'resolved'
    AND DATE(updated_at) < v_archive_date;
    
    COMMIT;
    
    SELECT CONCAT(v_affected_rows, ' incidents archived (older than ', p_days_old, ' days)') as message;
END$$

DELIMITER ;

-- ============================================
-- End of Stored Procedures
-- ============================================
