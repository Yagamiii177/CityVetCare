import express from 'express';
import CatcherTeam from '../models/CatcherTeam.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('CATCHERS');

/**
 * GET /api/catchers
 * Get all catcher teams
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status
    };

    const teams = await CatcherTeam.getAll(filters);
    
    res.json({
      records: teams,
      total: teams.length,
      message: teams.length === 0 ? 'No catcher teams found' : undefined
    });
  } catch (error) {
    logger.error('Error fetching catcher teams', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch catcher teams',
      details: error.message 
    });
  }
});

/**
 * GET /api/catchers/:id
 * Get single catcher team by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const team = await CatcherTeam.getById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ 
        error: true,
        message: 'Catcher team not found' 
      });
    }

    res.json(team);
  } catch (error) {
    logger.error('Error fetching catcher team', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch catcher team',
      details: error.message 
    });
  }
});

/**
 * POST /api/catchers
 * Create new catcher team
 */
router.post('/', async (req, res) => {
  try {
    const { team_name, leader_name, contact_number } = req.body;

    if (!team_name || !leader_name || !contact_number) {
      return res.status(400).json({ 
        error: true,
        message: 'Team name, leader name, and contact number are required' 
      });
    }

    const team = await CatcherTeam.create(req.body);
    
    res.status(201).json({
      message: 'Catcher team created successfully',
      id: team.id,
      data: team
    });
  } catch (error) {
    logger.error('Error creating catcher team', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to create catcher team',
      details: error.message 
    });
  }
});

/**
 * PUT /api/catchers/:id
 * Update catcher team
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await CatcherTeam.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ 
        error: true,
        message: 'Catcher team not found or no changes made' 
      });
    }

    res.json({ 
      message: 'Catcher team updated successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error updating catcher team', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to update catcher team',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/catchers/:id
 * Delete catcher team
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CatcherTeam.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: true,
        message: 'Catcher team not found' 
      });
    }

    res.json({ 
      message: 'Catcher team deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error deleting catcher team', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to delete catcher team',
      details: error.message 
    });
  }
});

export default router;
