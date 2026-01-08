import express from 'express';
import pool from '../config/database.js';
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
        ps.schedule_id,
        ps.report_id,
        ps.assigned_catcher_id,
        ps.schedule_date,
        ps.schedule_time,
        ps.status,
        ps.notes,
        ps.created_at,
        ps.updated_at,
        ir.description as incident_description,
        ir.report_type,
        ir.priority,
        il.address_text as incident_location,
        dc.full_name as catcher_name
      FROM patrol_schedule ps
      LEFT JOIN incident_report ir ON ps.report_id = ir.report_id
      LEFT JOIN incident_location il ON ir.location_id = il.location_id
      LEFT JOIN dog_catcher dc ON ps.assigned_catcher_id = dc.catcher_id
      ORDER BY ps.schedule_date DESC, ps.schedule_time DESC
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
      message: 'Failed to fetch schedules',
      details: error.message
    });
  }
});

/**
 * POST /api/schedules
 * Create new schedule (assign and schedule patrol)
 */
router.post('/', async (req, res) => {
  try {
    const { report_id, assigned_catcher_id, schedule_date, schedule_time, notes } = req.body;
    
    if (!report_id || !assigned_catcher_id || !schedule_date) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: report_id, assigned_catcher_id, schedule_date'
      });
    }
    
    // Check if incident report exists
    const [reports] = await pool.execute(
      'SELECT report_id FROM incident_report WHERE report_id = ?',
      [report_id]
    );
    
    if (reports.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Incident report not found'
      });
    }
    
    // Create schedule
    const [result] = await pool.execute(`
      INSERT INTO patrol_schedule (
        report_id, assigned_catcher_id, schedule_date, schedule_time, status, notes
      ) VALUES (?, ?, ?, ?, 'Assigned', ?)
    `, [
      report_id,
      assigned_catcher_id,
      schedule_date,
      schedule_time || null,
      notes || null
    ]);
    
    // Update incident report status to 'Scheduled'
    await pool.execute(
      'UPDATE incident_report SET status = ? WHERE report_id = ?',
      ['Scheduled', report_id]
    );
    
    logger.info(`Schedule created for report ${report_id}`);
    
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
      `UPDATE patrol_schedule SET ${fields.join(', ')} WHERE schedule_id = ?`,
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
      message: 'Failed to update schedule',
      details: error.message
    });
  }
});

export default router;
