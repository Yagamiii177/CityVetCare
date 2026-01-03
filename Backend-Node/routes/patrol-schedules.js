import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';
import { createNotification } from './notifications.js';
import { logAudit } from './audit.js';

const router = express.Router();

/**
 * @route   GET /api/patrol-schedules
 * @desc    Get all patrol schedules with filters
 * @access  Private (Admin, Veterinarian, Catcher)
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'veterinarian', 'catcher'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status = null,
      patrol_outcome = null,
      patrol_staff_id = null,
      date_from = null,
      date_to = null
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        s.*,
        ps.first_name as staff_first_name,
        ps.last_name as staff_last_name,
        ps.phone_number as staff_phone,
        ct.team_name as team_name,
        i.title as incident_title,
        i.location as incident_location,
        i.latitude as incident_latitude,
        i.longitude as incident_longitude,
        i.incident_type as incident_type,
        i.priority as incident_priority
      FROM schedules s
      LEFT JOIN patrol_staff ps ON s.patrol_staff_id = ps.id
      LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
      LEFT JOIN incidents i ON s.incident_id = i.id
      WHERE 1=1
    `;
    const params = [];
    
    // Apply filters
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    
    if (patrol_outcome) {
      sql += ' AND s.patrol_outcome = ?';
      params.push(patrol_outcome);
    }
    
    if (patrol_staff_id) {
      sql += ' AND s.patrol_staff_id = ?';
      params.push(patrol_staff_id);
    }
    
    // If user is a catcher, only show their assigned patrols
    if (req.user.role === 'catcher') {
      sql += ' AND ps.user_id = ?';
      params.push(req.user.id);
    }
    
    if (date_from) {
      sql += ' AND s.scheduled_date >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      sql += ' AND s.scheduled_date <= ?';
      params.push(date_to);
    }
    
    sql += ' ORDER BY s.scheduled_date DESC, s.scheduled_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const schedules = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM schedules s';
    let countJoin = ' LEFT JOIN patrol_staff ps ON s.patrol_staff_id = ps.id';
    let countWhere = ' WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countWhere += ' AND s.status = ?';
      countParams.push(status);
    }
    
    if (patrol_outcome) {
      countWhere += ' AND s.patrol_outcome = ?';
      countParams.push(patrol_outcome);
    }
    
    if (patrol_staff_id) {
      countWhere += ' AND s.patrol_staff_id = ?';
      countParams.push(patrol_staff_id);
    }
    
    if (req.user.role === 'catcher') {
      countWhere += ' AND ps.user_id = ?';
      countParams.push(req.user.id);
    }
    
    const [countResult] = await query(countSql + countJoin + countWhere, countParams);
    
    res.json({
      success: true,
      data: {
        schedules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get patrol schedules error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve patrol schedules'
    });
  }
});

/**
 * @route   GET /api/patrol-schedules/:id
 * @desc    Get patrol schedule by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [schedule] = await query(`
      SELECT 
        s.*,
        ps.first_name as staff_first_name,
        ps.last_name as staff_last_name,
        ps.phone_number as staff_phone,
        ps.email as staff_email,
        ct.team_name as team_name,
        i.title as incident_title,
        i.description as incident_description,
        i.location as incident_location,
        i.latitude as incident_latitude,
        i.longitude as incident_longitude,
        i.incident_type as incident_type,
        i.priority as incident_priority,
        i.images as incident_images,
        assigned_user.username as assigned_by_username
      FROM schedules s
      LEFT JOIN patrol_staff ps ON s.patrol_staff_id = ps.id
      LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
      LEFT JOIN incidents i ON s.incident_id = i.id
      LEFT JOIN users assigned_user ON s.assigned_by = assigned_user.id
      WHERE s.id = ?
    `, [id]);
    
    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: 'Patrol schedule not found'
      });
    }
    
    // Parse images if present
    if (schedule.incident_images) {
      schedule.incident_images = JSON.parse(schedule.incident_images);
    }
    
    res.json({
      success: true,
      data: { schedule }
    });
  } catch (error) {
    console.error('Get patrol schedule error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve patrol schedule'
    });
  }
});

/**
 * @route   POST /api/patrol-schedules
 * @desc    Create new patrol schedule (assign patrol)
 * @access  Private (Admin, Veterinarian)
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'veterinarian'), [
  body('incident_id')
    .isInt()
    .withMessage('Valid incident ID is required'),
  body('patrol_staff_id')
    .isInt()
    .withMessage('Valid patrol staff ID is required'),
  body('scheduled_date')
    .isDate()
    .withMessage('Valid date is required'),
  body('scheduled_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Valid time format (HH:MM:SS) is required'),
  body('notes')
    .optional()
    .trim(),
  handleValidation
], async (req, res) => {
  try {
    const { 
      incident_id, 
      patrol_staff_id, 
      scheduled_date, 
      scheduled_time, 
      notes = null 
    } = req.body;
    
    // Verify incident exists and is verified
    const [incident] = await query(
      'SELECT * FROM incidents WHERE id = ? AND status = ?',
      [incident_id, 'verified']
    );
    
    if (!incident) {
      return res.status(400).json({
        error: true,
        message: 'Incident not found or not verified'
      });
    }
    
    // Verify patrol staff exists and is available
    const [staff] = await query(
      'SELECT * FROM patrol_staff WHERE id = ?',
      [patrol_staff_id]
    );
    
    if (!staff) {
      return res.status(400).json({
        error: true,
        message: 'Patrol staff not found'
      });
    }
    
    // Create schedule
    const result = await query(`
      INSERT INTO schedules (
        catcher_team_id, 
        patrol_staff_id, 
        incident_id, 
        scheduled_date, 
        scheduled_time,
        status,
        patrol_outcome,
        notes,
        assigned_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      staff.team_id,
      patrol_staff_id,
      incident_id,
      scheduled_date,
      scheduled_time,
      'scheduled',
      'pending',
      notes,
      req.user.id
    ]);
    
    const scheduleId = result.insertId;
    
    // Update incident status
    await query(
      'UPDATE incidents SET status = ?, assigned_catcher_id = ? WHERE id = ?',
      ['in_progress', staff.team_id, incident_id]
    );
    
    // Update staff availability
    await query(
      'UPDATE patrol_staff SET availability_status = ? WHERE id = ?',
      ['on_patrol', patrol_staff_id]
    );
    
    // Create notification for assigned catcher
    if (staff.user_id) {
      await createNotification({
        userId: staff.user_id,
        type: 'patrol_assigned',
        title: 'New Patrol Assignment',
        message: `You have been assigned to patrol: ${incident.title}`,
        relatedEntityType: 'patrol',
        relatedEntityId: scheduleId
      });
    }
    
    // Notify incident reporter
    if (incident.reporter_id) {
      await createNotification({
        userId: incident.reporter_id,
        type: 'patrol_assigned',
        title: 'Patrol Assigned',
        message: `A patrol has been assigned to your reported incident: ${incident.title}`,
        relatedEntityType: 'incident',
        relatedEntityId: incident_id
      });
    }
    
    // Log audit
    await logAudit({
      entityType: 'patrol',
      entityId: scheduleId,
      action: 'assign',
      performedBy: req.user.id,
      newValue: {
        patrol_staff_id,
        incident_id,
        scheduled_date,
        scheduled_time
      },
      notes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
      success: true,
      message: 'Patrol scheduled successfully',
      data: {
        scheduleId
      }
    });
  } catch (error) {
    console.error('Create patrol schedule error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create patrol schedule'
    });
  }
});

/**
 * @route   PUT /api/patrol-schedules/:id/status
 * @desc    Update patrol status (for catcher during execution)
 * @access  Private (Catcher, Admin, Veterinarian)
 */
router.put('/:id/status', authenticateToken, authorizeRoles('catcher', 'admin', 'veterinarian'), [
  body('status')
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('patrol_outcome')
    .optional()
    .isIn(['captured', 'not_found', 'rescheduled', 'cancelled', 'in_progress', 'pending'])
    .withMessage('Invalid patrol outcome'),
  body('outcome_notes')
    .optional()
    .trim(),
  handleValidation
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, patrol_outcome = null, outcome_notes = null } = req.body;
    
    // Get current schedule
    const [schedule] = await query(`
      SELECT s.*, ps.user_id 
      FROM schedules s
      LEFT JOIN patrol_staff ps ON s.patrol_staff_id = ps.id
      WHERE s.id = ?
    `, [id]);
    
    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: 'Patrol schedule not found'
      });
    }
    
    // Verify ownership if user is catcher
    if (req.user.role === 'catcher' && schedule.user_id !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'You can only update your own patrol schedules'
      });
    }
    
    // Update schedule
    let updateSql = 'UPDATE schedules SET status = ?';
    const updateParams = [status];
    
    if (patrol_outcome) {
      updateSql += ', patrol_outcome = ?';
      updateParams.push(patrol_outcome);
    }
    
    if (outcome_notes) {
      updateSql += ', outcome_notes = ?';
      updateParams.push(outcome_notes);
    }
    
    if (status === 'completed') {
      updateSql += ', completed_at = NOW()';
      
      // Update patrol staff availability
      await query(
        'UPDATE patrol_staff SET availability_status = ? WHERE id = ?',
        ['available', schedule.patrol_staff_id]
      );
      
      // Update incident status based on outcome
      if (patrol_outcome === 'captured') {
        await query(
          'UPDATE incidents SET status = ? WHERE id = ?',
          ['resolved', schedule.incident_id]
        );
      }
    }
    
    updateSql += ' WHERE id = ?';
    updateParams.push(id);
    
    await query(updateSql, updateParams);
    
    // Create notifications
    if (status === 'completed' && schedule.incident_id) {
      const [incident] = await query('SELECT reporter_id, title FROM incidents WHERE id = ?', [schedule.incident_id]);
      
      if (incident && incident.reporter_id) {
        await createNotification({
          userId: incident.reporter_id,
          type: 'patrol_completed',
          title: 'Patrol Completed',
          message: `Patrol for "${incident.title}" has been completed. Outcome: ${patrol_outcome || 'pending'}`,
          relatedEntityType: 'incident',
          relatedEntityId: schedule.incident_id
        });
      }
      
      // Notify admin/vet
      const admins = await query(
        'SELECT id FROM users WHERE role IN (?, ?)',
        ['admin', 'veterinarian']
      );
      
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'patrol_completed',
          title: 'Patrol Completed',
          message: `Patrol #${id} completed. Outcome: ${patrol_outcome || 'pending'}`,
          relatedEntityType: 'patrol',
          relatedEntityId: id
        });
      }
    }
    
    // Log audit
    await logAudit({
      entityType: 'patrol',
      entityId: id,
      action: 'update',
      performedBy: req.user.id,
      oldValue: { status: schedule.status, patrol_outcome: schedule.patrol_outcome },
      newValue: { status, patrol_outcome },
      notes: outcome_notes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      success: true,
      message: 'Patrol status updated successfully'
    });
  } catch (error) {
    console.error('Update patrol status error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update patrol status'
    });
  }
});

/**
 * @route   GET /api/patrol-schedules/staff/:staffId/assigned
 * @desc    Get assigned patrols for a specific staff member
 * @access  Private (Catcher)
 */
router.get('/staff/:staffId/assigned', authenticateToken, authorizeRoles('catcher'), async (req, res) => {
  try {
    const { staffId } = req.params;
    
    // Verify ownership
    const [staff] = await query(
      'SELECT * FROM patrol_staff WHERE id = ? AND user_id = ?',
      [staffId, req.user.id]
    );
    
    if (!staff) {
      return res.status(403).json({
        error: true,
        message: 'Unauthorized access'
      });
    }
    
    const schedules = await query(`
      SELECT 
        s.*,
        i.title as incident_title,
        i.description as incident_description,
        i.location as incident_location,
        i.latitude as incident_latitude,
        i.longitude as incident_longitude,
        i.incident_type as incident_type,
        i.priority as incident_priority,
        i.images as incident_images
      FROM schedules s
      JOIN incidents i ON s.incident_id = i.id
      WHERE s.patrol_staff_id = ? AND s.status IN ('scheduled', 'in_progress')
      ORDER BY s.scheduled_date, s.scheduled_time
    `, [staffId]);
    
    // Parse images
    const parsedSchedules = schedules.map(schedule => ({
      ...schedule,
      incident_images: schedule.incident_images ? JSON.parse(schedule.incident_images) : []
    }));
    
    res.json({
      success: true,
      data: {
        schedules: parsedSchedules
      }
    });
  } catch (error) {
    console.error('Get assigned patrols error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve assigned patrols'
    });
  }
});

export default router;
