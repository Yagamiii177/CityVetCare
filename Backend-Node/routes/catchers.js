import express from 'express';
import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('CATCHERS');

/**
 * GET /api/catchers
 * Get all catcher teams
 */
router.get('/', async (req, res) => {
  try {
    const [teams] = await pool.execute('SELECT * FROM catcher_teams ORDER BY team_name');
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    logger.error('Failed to fetch catcher teams', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch catcher teams'
    });
  }
});

/**
 * GET /api/catchers/:id
 * Get single catcher team
 */
router.get('/:id', async (req, res) => {
  try {
    const [teams] = await pool.execute('SELECT * FROM catcher_teams WHERE id = ?', [req.params.id]);
    
    if (teams.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Catcher team not found'
      });
    }
    
    res.json({
      success: true,
      data: teams[0]
    });
  } catch (error) {
    logger.error('Failed to fetch catcher team', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch catcher team'
    });
  }
});

export default router;
