import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';
import { createNotification } from './notifications.js';

const router = express.Router();

/**
 * Log audit entry
 */
const logAudit = async ({ entityType, entityId, action, performedBy, oldValue = null, newValue = null, notes = null, ipAddress = null, userAgent = null }) => {
  try {
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, old_value, new_value, notes, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entityType,
        entityId,
        action,
        performedBy,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        notes,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

/**
 * @route   GET /api/audit
 * @desc    Get audit logs with filtering
 * @access  Private (Admin, Veterinarian)
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'veterinarian'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      entity_type = null,
      entity_id = null,
      action = null,
      performed_by = null,
      start_date = null,
      end_date = null
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT a.*, u.username as performed_by_username, u.role as performed_by_role
      FROM audit_logs a
      JOIN users u ON a.performed_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (entity_type) {
      sql += ' AND a.entity_type = ?';
      params.push(entity_type);
    }
    
    if (entity_id) {
      sql += ' AND a.entity_id = ?';
      params.push(entity_id);
    }
    
    if (action) {
      sql += ' AND a.action = ?';
      params.push(action);
    }
    
    if (performed_by) {
      sql += ' AND a.performed_by = ?';
      params.push(performed_by);
    }
    
    if (start_date) {
      sql += ' AND a.created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND a.created_at <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const logs = await query(sql, params);
    
    // Parse JSON fields
    const parsedLogs = logs.map(log => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null
    }));
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
    const countParams = [];
    
    if (entity_type) {
      countSql += ' AND entity_type = ?';
      countParams.push(entity_type);
    }
    
    if (entity_id) {
      countSql += ' AND entity_id = ?';
      countParams.push(entity_id);
    }
    
    const [countResult] = await query(countSql, countParams);
    
    res.json({
      success: true,
      data: {
        logs: parsedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve audit logs'
    });
  }
});

/**
 * @route   GET /api/audit/incident/:id
 * @desc    Get audit trail for specific incident
 * @access  Private
 */
router.get('/incident/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const logs = await query(`
      SELECT a.*, u.username as performed_by_username, u.role as performed_by_role
      FROM audit_logs a
      JOIN users u ON a.performed_by = u.id
      WHERE a.entity_type = 'incident' AND a.entity_id = ?
      ORDER BY a.created_at DESC
    `, [id]);
    
    // Parse JSON fields
    const parsedLogs = logs.map(log => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null
    }));
    
    res.json({
      success: true,
      data: {
        logs: parsedLogs
      }
    });
  } catch (error) {
    console.error('Get incident audit trail error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve incident audit trail'
    });
  }
});

export default router;
export { logAudit };
