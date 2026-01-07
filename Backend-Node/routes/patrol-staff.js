import express from 'express';
import PatrolStaff from '../models/PatrolStaff.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('PATROL-STAFF');

/**
 * GET /api/patrol-staff
 * Get all patrol staff
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      availability: req.query.availability,
      status: req.query.status
    };

    const staff = await PatrolStaff.getAll(filters);
    
    res.json({
      success: true,
      records: staff,
      total: staff.length,
      message: staff.length === 0 ? 'No patrol staff found' : undefined
    });
  } catch (error) {
    logger.error('Error fetching patrol staff', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol staff',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-staff/:id
 * Get single patrol staff by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const staff = await PatrolStaff.getById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol staff not found' 
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    logger.error('Error fetching patrol staff', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol staff',
      details: error.message 
    });
  }
});

/**
 * POST /api/patrol-staff
 * Create new patrol staff
 */
router.post('/', async (req, res) => {
  try {
    const { name, team_name, contact_number } = req.body;

    if (!name && !team_name) {
      return res.status(400).json({ 
        error: true,
        message: 'Name or team name is required' 
      });
    }

    const staff = await PatrolStaff.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Patrol staff created successfully',
      id: staff.id,
      data: staff
    });
  } catch (error) {
    logger.error('Error creating patrol staff', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to create patrol staff',
      details: error.message 
    });
  }
});

/**
 * PUT /api/patrol-staff/:id
 * Update patrol staff
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await PatrolStaff.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol staff not found or no changes made' 
      });
    }

    res.json({ 
      success: true,
      message: 'Patrol staff updated successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error updating patrol staff', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to update patrol staff',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/patrol-staff/:id
 * Delete patrol staff
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PatrolStaff.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol staff not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Patrol staff deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error deleting patrol staff', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to delete patrol staff',
      details: error.message 
    });
  }
});

export default router;
