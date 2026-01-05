import express from 'express';
import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('DASHBOARD');

/**
 * GET /api/dashboard
 * Get dashboard statistics using stored procedure
 */
router.get('/', async (req, res) => {
  try {
    // Call the comprehensive dashboard stored procedure
    const [results] = await pool.execute('CALL sp_dashboard_get_stats()');
    
    // The stored procedure returns 4 result sets:
    // [0] = Incident statistics
    // [1] = Catcher teams statistics
    // [2] = Patrol staff statistics
    // [3] = Patrol schedules statistics
    
    const incidentStats = results[0][0];
    const catcherStats = results[1][0];
    const staffStats = results[2][0];
    const scheduleStats = results[3][0];

    // Compile dashboard data
    const dashboardData = {
      success: true,
      summary: {
        total_incidents: incidentStats.total_incidents || 0,
        pending_incidents: incidentStats.pending_incidents || 0,
        approved_incidents: incidentStats.approved_incidents || 0,
        verified_incidents: incidentStats.verified_incidents || incidentStats.approved_incidents || 0,
        in_progress_incidents: incidentStats.in_progress_incidents || 0,
        resolved_incidents: incidentStats.resolved_incidents || 0,
        rejected_incidents: incidentStats.rejected_incidents || 0,
        total_catcher_teams: catcherStats.total_teams || 0,
        available_teams: catcherStats.available_teams || 0,
        on_duty_teams: catcherStats.on_duty_teams || 0,
        total_patrol_staff: staffStats.total_staff || 0,
        active_staff: staffStats.active_staff || 0,
        total_schedules: scheduleStats.total_schedules || 0,
        scheduled_patrols: scheduleStats.scheduled_patrols || 0,
        in_progress_patrols: scheduleStats.in_progress_patrols || 0,
        completed_patrols: scheduleStats.completed_patrols || 0
      },
      incident_stats: incidentStats,
      catcher_stats: catcherStats,
      staff_stats: staffStats,
      schedule_stats: scheduleStats
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard data', error);
    res.status(500).json({ 
      success: false,
      error: true,
      message: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/stats
 * Alias for dashboard endpoint (backward compatibility)
 */
router.get('/stats', async (req, res) => {
  try {
    const [results] = await pool.execute('CALL sp_dashboard_get_stats()');
    
    const incidentStats = results[0][0];
    const catcherStats = results[1][0];
    const staffStats = results[2][0];
    const scheduleStats = results[3][0];

    const dashboardData = {
      success: true,
      summary: {
        total_incidents: incidentStats.total_incidents || 0,
        pending_incidents: incidentStats.pending_incidents || 0,
        approved_incidents: incidentStats.approved_incidents || 0,
        verified_incidents: incidentStats.verified_incidents || incidentStats.approved_incidents || 0,
        in_progress_incidents: incidentStats.in_progress_incidents || 0,
        resolved_incidents: incidentStats.resolved_incidents || 0,
        rejected_incidents: incidentStats.rejected_incidents || 0,
        total_catcher_teams: catcherStats.total_teams || 0,
        available_teams: catcherStats.available_teams || 0,
        on_duty_teams: catcherStats.on_duty_teams || 0,
        total_patrol_staff: staffStats.total_staff || 0,
        active_staff: staffStats.active_staff || 0,
        total_schedules: scheduleStats.total_schedules || 0,
        scheduled_patrols: scheduleStats.scheduled_patrols || 0,
        in_progress_patrols: scheduleStats.in_progress_patrols || 0,
        completed_patrols: scheduleStats.completed_patrols || 0
      },
      incident_stats: incidentStats,
      catcher_stats: catcherStats,
      staff_stats: staffStats,
      schedule_stats: scheduleStats
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard stats', error);
    res.status(500).json({ 
      success: false,
      error: true,
      message: 'Failed to fetch dashboard stats',
      details: error.message 
    });
  }
});

export default router;
