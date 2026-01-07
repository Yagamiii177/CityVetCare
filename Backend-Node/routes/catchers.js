import express from 'express';
import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const router = express.Router();
const logger = new Logger('CATCHERS');

/**
 * GET /api/catchers
 * Get all dog catchers
 */
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM dog_catcher ORDER BY full_name';
    
    const [catchers] = await pool.execute(query);
    
    res.json({
      success: true,
      data: catchers
    });
  } catch (error) {
    logger.error('Failed to fetch dog catchers', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch dog catchers'
    });
  }
});

/**
 * GET /api/catchers/:id
 * Get single dog catcher
 */
router.get('/:id', async (req, res) => {
  try {
    const [catchers] = await pool.execute('SELECT * FROM dog_catcher WHERE catcher_id = ?', [req.params.id]);
    
    if (catchers.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Dog catcher not found'
      });
    }
    
    res.json({
      success: true,
      data: catchers[0]
    });
  } catch (error) {
    logger.error('Failed to fetch dog catcher', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch dog catcher'
    });
  }
});

export default router;
