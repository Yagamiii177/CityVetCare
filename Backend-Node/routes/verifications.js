import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';
import { createNotification } from './notifications.js';
import { logAudit } from './audit.js';

const router = express.Router();

/**
 * @route   GET /api/verifications/pending
 * @desc    Get incidents pending verification
 * @access  Private (Veterinarian, Admin)
 */
router.get('/pending', authenticateToken, authorizeRoles('veterinarian', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, incident_type = null } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT i.*, 
             u.username as reporter_username,
             u.email as reporter_email
      FROM incidents i
      LEFT JOIN users u ON i.reporter_id = u.id
      WHERE i.status = 'PENDING_VERIFICATION'
    `;
    const params = [];
    
    if (incident_type) {
      sql += ' AND i.incident_type = ?';
      params.push(incident_type);
    }
    
    sql += ' ORDER BY i.incident_date DESC, i.priority DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const incidents = await query(sql, params);
    
    // Parse JSON fields
    const parsedIncidents = incidents.map(incident => ({
      ...incident,
      images: incident.images ? JSON.parse(incident.images) : []
    }));
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM incidents WHERE status = ?';
    const countParams = ['PENDING_VERIFICATION'];
    
    if (incident_type) {
      countSql += ' AND incident_type = ?';
      countParams.push(incident_type);
    }
    
    const [countResult] = await query(countSql, countParams);
    
    res.json({
      success: true,
      data: {
        incidents: parsedIncidents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve pending verifications'
    });
  }
});

/**
 * @route   POST /api/verifications/:id/approve
 * @desc    Approve incident after verification
 * @access  Private (Veterinarian, Admin)
 */
router.post('/:id/approve', authenticateToken, authorizeRoles('veterinarian', 'admin'), [
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  handleValidation
], async (req, res) => {
  try {
    const { id } = req.params;
    const { notes = null, priority = null } = req.body;
    
    // Get current incident
    const [incident] = await query('SELECT * FROM incidents WHERE id = ?', [id]);
    
    if (!incident) {
      return res.status(404).json({
        error: true,
        message: 'Incident not found'
      });
    }
    
    if (incident.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({
        error: true,
        message: 'Incident is not pending verification'
      });
    }
    
    // Update incident
    let updateSql = `
      UPDATE incidents 
      SET status = 'verified',
          verified_by = ?,
          verified_at = NOW(),
          verification_notes = ?
    `;
    const updateParams = [req.user.id, notes];
    
    if (priority) {
      updateSql += ', priority = ?';
      updateParams.push(priority);
    }
    
    updateSql += ' WHERE id = ?';
    updateParams.push(id);
    
    await query(updateSql, updateParams);
    
    // Create notification for reporter
    if (incident.reporter_id) {
      await createNotification({
        userId: incident.reporter_id,
        type: 'report_verified',
        title: 'Report Verified',
        message: `Your incident report "${incident.title}" has been verified and approved.`,
        relatedEntityType: 'incident',
        relatedEntityId: id
      });
    }
    
    // Log audit
    await logAudit({
      entityType: 'incident',
      entityId: id,
      action: 'verify',
      performedBy: req.user.id,
      oldValue: { status: incident.status },
      newValue: { 
        status: 'verified', 
        verified_by: req.user.id, 
        priority: priority || incident.priority 
      },
      notes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Get updated incident
    const [updatedIncident] = await query('SELECT * FROM incidents WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Incident approved successfully',
      data: {
        incident: {
          ...updatedIncident,
          images: updatedIncident.images ? JSON.parse(updatedIncident.images) : []
        }
      }
    });
  } catch (error) {
    console.error('Approve incident error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to approve incident'
    });
  }
});

/**
 * @route   POST /api/verifications/:id/reject
 * @desc    Reject incident after verification
 * @access  Private (Veterinarian, Admin)
 */
router.post('/:id/reject', authenticateToken, authorizeRoles('veterinarian', 'admin'), [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
  handleValidation
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get current incident
    const [incident] = await query('SELECT * FROM incidents WHERE id = ?', [id]);
    
    if (!incident) {
      return res.status(404).json({
        error: true,
        message: 'Incident not found'
      });
    }
    
    if (incident.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({
        error: true,
        message: 'Incident is not pending verification'
      });
    }
    
    // Update incident
    await query(`
      UPDATE incidents 
      SET status = 'rejected',
          verified_by = ?,
          verified_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
    `, [req.user.id, reason, id]);
    
    // Create notification for reporter
    if (incident.reporter_id) {
      await createNotification({
        userId: incident.reporter_id,
        type: 'report_rejected',
        title: 'Report Rejected',
        message: `Your incident report "${incident.title}" was not verified. Reason: ${reason}`,
        relatedEntityType: 'incident',
        relatedEntityId: id
      });
    }
    
    // Log audit
    await logAudit({
      entityType: 'incident',
      entityId: id,
      action: 'reject',
      performedBy: req.user.id,
      oldValue: { status: incident.status },
      newValue: { status: 'rejected', verified_by: req.user.id },
      notes: reason,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      success: true,
      message: 'Incident rejected',
      data: {
        reason
      }
    });
  } catch (error) {
    console.error('Reject incident error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to reject incident'
    });
  }
});

/**
 * @route   GET /api/verifications/stats
 * @desc    Get verification statistics
 * @access  Private (Veterinarian, Admin)
 */
router.get('/stats', authenticateToken, authorizeRoles('veterinarian', 'admin'), async (req, res) => {
  try {
    const [stats] = await query(`
      SELECT 
        COUNT(*) as total_pending,
        SUM(CASE WHEN incident_type = 'bite' THEN 1 ELSE 0 END) as bite_reports,
        SUM(CASE WHEN incident_type = 'stray' THEN 1 ELSE 0 END) as stray_reports,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_reports,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_reports
      FROM incidents
      WHERE status = 'PENDING_VERIFICATION'
    `);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve verification statistics'
    });
  }
});

export default router;
