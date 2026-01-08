import express from 'express';
import Incident from '../models/Incident.js';
import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('DASHBOARD');

/**
 * GET /api/dashboard
 * Get dashboard statistics
 */
router.get('/', async (req, res) => {
  try {
    // Get incident counts by status
    const counts = await Incident.getCountsByStatus();
    
    // Get today's patrols/schedules
    const [todaySchedules] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM patrol_schedule 
      WHERE DATE(schedule_date) = CURDATE() 
      AND status != 'cancelled'
    `);
    
    // Get patrol status counts
    const [patrolCounts] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'Assigned' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'On Patrol' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled
      FROM patrol_schedule
    `);
    
    // Get recent incidents (last 5)
    const recentIncidents = await Incident.getAll({ limit: 5, offset: 0 });
    
    // Get today's patrol schedules
    const [todaysPatrols] = await pool.execute(`
      SELECT ps.*, ir.report_type, ir.status as incident_status, il.address_text as location
      FROM patrol_schedule ps
      LEFT JOIN incident_report ir ON ps.report_id = ir.report_id
      LEFT JOIN incident_location il ON ir.location_id = il.location_id
      WHERE DATE(ps.schedule_date) = CURDATE()
      ORDER BY ps.schedule_date ASC
      LIMIT 10
    `);
    
    // Get active staff count
    const [activeStaff] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM dog_catcher 
      WHERE 1=1
    `);
    
    // Count staff currently on patrol
    const [onPatrol] = await pool.execute(`
      SELECT COUNT(DISTINCT assigned_catcher_id) as count
      FROM patrol_schedule
      WHERE status = 'On Patrol'
      AND DATE(schedule_date) = CURDATE()
    `);
    
    // Get activity trends for last 7 days
    const [activityTrends] = await pool.execute(`
      SELECT 
        DATE(reported_at) as date,
        COUNT(*) as incident_count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM incident_report
      WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(reported_at)
      ORDER BY date DESC
    `);
    
    const patrolStats = patrolCounts[0];
    
    res.json({
      success: true,
      data: {
        incidents: {
          total_incidents: counts.total || 0,
          bite_incidents: counts.bite_incidents || 0,
          stray_incidents: counts.stray_incidents || 0,
          urgent: counts.urgent || 0,
          high_priority: counts.high_priority || 0,
          in_progress: counts.in_progress || 0,
          verified: counts.verified || 0,
          resolved: counts.resolved || 0,
          rejected: counts.rejected || 0
        },
        patrols: {
          scheduled: patrolStats.scheduled || 0,
          in_progress: patrolStats.in_progress || 0,
          completed: patrolStats.completed || 0,
          cancelled: patrolStats.cancelled || 0,
          captured: 0,
          not_found: 0,
          rescheduled: 0
        },
        staff: {
          available: activeStaff[0].count || 0,
          on_patrol: onPatrol[0].count || 0
        },
        verification: {
          pending_verification: counts.pending || 0,
          urgent_verifications: counts.urgent || 0,
          overdue_verifications: 0
        },
        recentIncidents: recentIncidents,
        todaysPatrols: todaysPatrols,
        activityTrends: activityTrends,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard data', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics (alias)
 */
router.get('/stats', async (req, res) => {
  try {
    const counts = await Incident.getCountsByStatus();
    
    res.json({
      success: true,
      data: {
        total_reports: counts.total,
        pending: counts.pending,
        verified: counts.verified,
        in_progress: counts.in_progress,
        resolved: counts.resolved,
        assigned: counts.assigned,
        scheduled: counts.scheduled
      }
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

export default router;
