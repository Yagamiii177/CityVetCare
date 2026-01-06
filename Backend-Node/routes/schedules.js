import express from 'express';
import pool from '../config/database.js';
import Incident from '../models/Incident.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('SCHEDULES');

/**
 * GET /api/schedules
 * Get all schedules
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        i.title as incident_title,
        i.location as incident_location,
        ct.team_name as catcher_team_name
      FROM schedules s
      LEFT JOIN incidents i ON s.incident_id = i.id
      LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
      ORDER BY s.scheduled_date DESC, s.scheduled_time DESC
    `;
    
    const [schedules] = await pool.execute(query);
    
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    logger.error('Failed to fetch schedules', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch schedules'
    });
  }
});

/**
 * POST /api/schedules
 * Create new schedule (assign and schedule patrol)
 */
router.post('/', async (req, res) => {
  try {
    const { incident_id, catcher_team_id, assigned_staff_name, scheduled_date, scheduled_time, notes } = req.body;
    
    if (!incident_id || !scheduled_date || !scheduled_time) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: incident_id, scheduled_date, scheduled_time'
      });
    }
    
    // Get incident location
    const incident = await Incident.getById(incident_id);
    if (!incident) {
      return res.status(404).json({
        error: true,
        message: 'Incident not found'
      });
    }
    
    // Create schedule
    const [result] = await pool.execute(`
      INSERT INTO schedules (
        incident_id, catcher_team_id, assigned_staff_name,
        scheduled_date, scheduled_time, location, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)
    `, [
      incident_id,
      catcher_team_id || null,
      assigned_staff_name || null,
      scheduled_date,
      scheduled_time,
      incident.location,
      notes || null
    ]);
    
    // Update incident status to 'scheduled'
    await Incident.update(incident_id, {
      status: 'scheduled',
      assigned_catcher_id: catcher_team_id || null,
      assigned_staff_name: assigned_staff_name || null
    });
    
    logger.info(`Schedule created for incident ${incident_id}`);
    
    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      id: result.insertId
    });
  } catch (error) {
    logger.error('Failed to create schedule', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create schedule',
      details: error.message
    });
  }
});

/**
 * PUT /api/schedules/:id
 * Update schedule
 */
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const fields = [];
    const params = [];
    
    if (status) {
      fields.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      fields.push('notes = ?');
      params.push(notes);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No fields to update'
      });
    }
    
    params.push(req.params.id);
    
    const [result] = await pool.execute(
      `UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update schedule', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update schedule'
    });
  }
});

export default router;
