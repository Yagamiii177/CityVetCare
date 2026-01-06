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
      FROM schedules 
      WHERE scheduled_date = CURDATE() 
      AND status != 'cancelled'
    `);
    
    // Get recent incidents (last 5)
    const recentIncidents = await Incident.getAll({ limit: 5, offset: 0 });
    
    // Get active catchers
    const [activeCatchers] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM catcher_teams 
      WHERE status = 'available'
    `);
    
    res.json({
      success: true,
      summary: {
        total_incidents: counts.total,
        pending_incidents: counts.pending,
        verified_incidents: counts.verified,
        in_progress_incidents: counts.in_progress,
        resolved_incidents: counts.resolved,
        today_patrols: todaySchedules[0].count,
        active_catchers: activeCatchers[0].count
      },
      counts: counts,
      recent_incidents: recentIncidents
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
