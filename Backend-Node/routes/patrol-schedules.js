import express from 'express';
import PatrolSchedule from '../models/PatrolSchedule.js';

const router = express.Router();

/**
 * GET /api/patrol-PatrolSchedules
 * Get all patrol PatrolSchedules
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      incident_id: req.query.incident_id
    };

    const PatrolSchedules = await PatrolSchedule.getAll(filters);
    
    res.json({
      records: PatrolSchedules,
      total: PatrolSchedules.length,
      message: PatrolSchedules.length === 0 ? 'No patrol PatrolSchedules found' : undefined
    });
  } catch (error) {
    console.error('Error fetching patrol PatrolSchedules:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol PatrolSchedules',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-PatrolSchedules/incident/:incidentId
 * Get PatrolSchedules by incident ID
 */
router.get('/incident/:incidentId', async (req, res) => {
  try {
    const PatrolSchedules = await PatrolSchedule.getByIncidentId(req.params.incidentId);
    
    res.json({
      records: PatrolSchedules,
      total: PatrolSchedules.length
    });
  } catch (error) {
    console.error('Error fetching patrol PatrolSchedules:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol PatrolSchedules',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-PatrolSchedules/:id
 * Get single patrol PatrolSchedule by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const PatrolSchedule = await PatrolSchedule.getById(req.params.id);
    
    if (!PatrolSchedule) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol PatrolSchedule not found' 
      });
    }

    res.json(PatrolSchedule);
  } catch (error) {
    console.error('Error fetching patrol PatrolSchedule:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol PatrolSchedule',
      details: error.message 
    });
  }
});

/**
 * POST /api/patrol-PatrolSchedules
 * Create new patrol PatrolSchedule
 */
router.post('/', async (req, res) => {
  try {
    const { incident_id, PatrolSchedule_date } = req.body;

    if (!incident_id || !PatrolSchedule_date) {
      return res.status(400).json({ 
        error: true,
        message: 'Incident ID and PatrolSchedule date are required' 
      });
    }

    const PatrolSchedule = await PatrolSchedule.create(req.body);
    
    res.status(201).json({
      message: 'Patrol PatrolSchedule created successfully',
      id: PatrolSchedule.id,
      data: PatrolSchedule
    });
  } catch (error) {
    console.error('Error creating patrol PatrolSchedule:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to create patrol PatrolSchedule',
      details: error.message 
    });
  }
});

/**
 * PUT /api/patrol-PatrolSchedules/:id
 * Update patrol PatrolSchedule
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await PatrolSchedule.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol PatrolSchedule not found or no changes made' 
      });
    }

    res.json({ 
      message: 'Patrol PatrolSchedule updated successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error updating patrol PatrolSchedule:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to update patrol PatrolSchedule',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/patrol-PatrolSchedules/:id
 * Delete patrol PatrolSchedule
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PatrolSchedule.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol PatrolSchedule not found' 
      });
    }

    res.json({ 
      message: 'Patrol PatrolSchedule deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error deleting patrol PatrolSchedule:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to delete patrol PatrolSchedule',
      details: error.message 
    });
  }
});

export default router;

