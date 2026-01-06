-- Fix Dashboard Stats Stored Procedure
-- Adds verified_incidents field alongside approved_incidents

USE cityvetcare_db;

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

SELECT 'Dashboard stats procedure updated successfully' as Status;
