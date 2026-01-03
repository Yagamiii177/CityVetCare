import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get comprehensive dashboard statistics
 * @access  Private (Admin, Veterinarian)
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'veterinarian'), async (req, res) => {
  try {
    // Get incident statistics
    const [incidentStats] = await query(`
      SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'PENDING_VERIFICATION' THEN 1 ELSE 0 END) as pending_verification,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN incident_type = 'bite' THEN 1 ELSE 0 END) as bite_incidents,
        SUM(CASE WHEN incident_type = 'stray' THEN 1 ELSE 0 END) as stray_incidents
      FROM incidents
    `);
    
    // Get recent incidents
    const recentIncidents = await query(`
      SELECT 
        i.id, i.title, i.location, i.status, i.priority, i.incident_type, 
        i.incident_date, i.created_at,
        u.username as reporter_username
      FROM incidents i
      LEFT JOIN users u ON i.reporter_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 10
    `);
    
    // Get patrol statistics
    const [patrolStats] = await query(`
      SELECT 
        COUNT(*) as total_patrols,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN patrol_outcome = 'captured' THEN 1 ELSE 0 END) as captured,
        SUM(CASE WHEN patrol_outcome = 'not_found' THEN 1 ELSE 0 END) as not_found,
        SUM(CASE WHEN patrol_outcome = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled
      FROM schedules
    `);
    
    // Get staff availability
    const [staffStats] = await query(`
      SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN availability_status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN availability_status = 'on_patrol' THEN 1 ELSE 0 END) as on_patrol,
        SUM(CASE WHEN availability_status = 'off_duty' THEN 1 ELSE 0 END) as off_duty,
        SUM(CASE WHEN availability_status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
      FROM patrol_staff
    `);
    
    // Get today's scheduled patrols
    const todaysPatrols = await query(`
      SELECT 
        s.id, s.scheduled_time, s.status, s.patrol_outcome,
        ps.first_name, ps.last_name,
        i.title as incident_title, i.location, i.priority
      FROM schedules s
      LEFT JOIN patrol_staff ps ON s.patrol_staff_id = ps.id
      LEFT JOIN incidents i ON s.incident_id = i.id
      WHERE s.scheduled_date = CURDATE()
      ORDER BY s.scheduled_time
    `);
    
    // Get verification queue count
    const [verificationStats] = await query(`
      SELECT 
        COUNT(*) as pending_verification,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_verifications,
        SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) > 24 THEN 1 ELSE 0 END) as overdue_verifications
      FROM incidents
      WHERE status = 'PENDING_VERIFICATION'
    `);
    
    // Get activity trends (last 7 days)
    const activityTrends = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as incident_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM incidents
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Get unread notifications count
    const [notificationCount] = await query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: {
        incidents: incidentStats,
        patrols: patrolStats,
        staff: staffStats,
        verification: verificationStats,
        recentIncidents,
        todaysPatrols,
        activityTrends,
        notifications: {
          unread_count: notificationCount.unread_count
        },
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      error: true,
      message: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/dashboard/map-data
 * @desc    Get incident and patrol data for map visualization
 * @access  Private (Admin, Veterinarian)
 */
router.get('/map-data', authenticateToken, authorizeRoles('admin', 'veterinarian'), async (req, res) => {
  try {
    const { status = null, incident_type = null } = req.query;
    
    let sql = `
      SELECT 
        i.id, 
        i.title, 
        i.location,
        i.latitude,
        i.longitude,
        i.status,
        i.priority,
        i.incident_type,
        i.incident_date,
        s.id as patrol_id,
        s.status as patrol_status,
        s.patrol_outcome
      FROM incidents i
      LEFT JOIN schedules s ON i.id = s.incident_id
      WHERE i.latitude IS NOT NULL AND i.longitude IS NOT NULL
    `;
    
    const params = [];
    
    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }
    
    if (incident_type) {
      sql += ' AND i.incident_type = ?';
      params.push(incident_type);
    }
    
    const mapData = await query(sql, params);
    
    res.json({
      success: true,
      data: {
        incidents: mapData
      }
    });
  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch map data'
    });
  }
});

export default router;
