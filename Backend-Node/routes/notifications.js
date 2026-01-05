import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';

const router = express.Router();

/**
 * Create notification
 */
const createNotification = async ({ userId, type, title, message, relatedEntityType = null, relatedEntityId = null }) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, relatedEntityType, relatedEntityId]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT id, type, title, message, related_entity_type, related_entity_id, 
             is_read, is_pushed, created_at
      FROM notifications
      WHERE user_id = ?
    `;
    
    const params = [req.user.id];
    
    if (unread_only === 'true') {
      sql += ' AND is_read = FALSE';
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const notifications = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
    const countParams = [req.user.id];
    
    if (unread_only === 'true') {
      countSql += ' AND is_read = FALSE';
    }
    
    const [countResult] = await query(countSql, countParams);
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve notifications'
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const [result] = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: {
        count: result.count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get unread count'
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const [notification] = await query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!notification) {
      return res.status(404).json({
        error: true,
        message: 'Notification not found'
      });
    }
    
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to mark notification as read'
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to mark all notifications as read'
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const [notification] = await query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!notification) {
      return res.status(404).json({
        error: true,
        message: 'Notification not found'
      });
    }
    
    await query('DELETE FROM notifications WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete notification'
    });
  }
});

// Export both router and helper function
export default router;
export { createNotification };
