import express from 'express';
import PatrolSchedule from '../models/PatrolSchedule.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('PATROL-SCHEDULES');

/**
 * GET /api/patrol-schedules
 * Get all patrol schedules
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      incident_id: req.query.incident_id
    };

    const schedules = await PatrolSchedule.getAll(filters);
    
    res.json({
      records: schedules,
      total: schedules.length,
      message: schedules.length === 0 ? 'No patrol schedules found' : undefined
    });
  } catch (error) {
    logger.error('Error fetching patrol schedules', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol schedules',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-schedules/incident/:incidentId
 * Get schedules by incident ID
 */
router.get('/incident/:incidentId', async (req, res) => {
  try {
    const schedules = await PatrolSchedule.getByIncidentId(req.params.incidentId);
    
    res.json({
      records: schedules,
      total: schedules.length
    });
  } catch (error) {
    logger.error('Error fetching patrol schedules', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol schedules',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-schedules/:id
 * Get single patrol schedule by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const schedule = await PatrolSchedule.getById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found' 
      });
    }

    res.json(schedule);
  } catch (error) {
    logger.error('Error fetching patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol schedule',
      details: error.message 
    });
  }
});

/**
 * POST /api/patrol-schedules
 * Create new patrol schedule
 */
router.post('/', async (req, res) => {
  try {
    const { incident_id, scheduled_date } = req.body;

    if (!incident_id || !scheduled_date) {
      return res.status(400).json({ 
        error: true,
        message: 'Incident ID and schedule date are required' 
      });
    }

    const schedule = await PatrolSchedule.create(req.body);
    
    res.status(201).json({
      message: 'Patrol schedule created successfully',
      id: schedule.id,
      data: schedule
    });
  } catch (error) {
    logger.error('Error creating patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to create patrol schedule',
      details: error.message 
    });
  }
});

/**
 * PUT /api/patrol-schedules/:id
 * Update patrol schedule
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await PatrolSchedule.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found or no changes made' 
      });
    }

    res.json({ 
      message: 'Patrol schedule updated successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error updating patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to update patrol schedule',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/patrol-schedules/:id
 * Delete patrol schedule
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PatrolSchedule.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found' 
      });
    }

    res.json({ 
      message: 'Patrol schedule deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error deleting patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to delete patrol schedule',
      details: error.message 
    });
  }
});

export default router;

