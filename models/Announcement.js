import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ANNOUNCEMENT_MODEL');

class Announcement {
  /**
   * Find announcement by announcement_id
   * @param {number} announcement_id
   * @returns {Promise<object|null>}
   */
  static async findById(announcement_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM announcement WHERE announcement_id = ?',
        [announcement_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding announcement by announcement_id', error);
      throw error;
    }
  }

  /**
   * Get all announcements
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM announcement');
      return rows;
    } catch (error) {
      logger.error('Error getting all announcements', error);
      throw error;
    }
  }

  /**
   * Create new announcement
   * @param {object} data - Announcement data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO announcement (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating announcement', error);
      throw error;
    }
  }

  /**
   * Update announcement
   * @param {number} announcement_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(announcement_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), announcement_id];

      const [result] = await pool.query(
        `UPDATE announcement SET ${fields} WHERE announcement_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating announcement', error);
      throw error;
    }
  }

  /**
   * Delete announcement
   * @param {number} announcement_id
   * @returns {Promise<object>}
   */
  static async delete(announcement_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM announcement WHERE announcement_id = ?',
        [announcement_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting announcement', error);
      throw error;
    }
  }

  /**
   * Count total announcements
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM announcement');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting announcements', error);
      throw error;
    }
  }
}

export default Announcement;
