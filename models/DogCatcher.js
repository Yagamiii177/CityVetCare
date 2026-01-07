import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('DOGCATCHER_MODEL');

class DogCatcher {
  /**
   * Find dogcatcher by catcher_id
   * @param {number} catcher_id
   * @returns {Promise<object|null>}
   */
  static async findById(catcher_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM dog_catcher WHERE catcher_id = ?',
        [catcher_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding dogcatcher by catcher_id', error);
      throw error;
    }
  }

  /**
   * Get all dogcatchers
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM dog_catcher');
      return rows;
    } catch (error) {
      logger.error('Error getting all dogcatchers', error);
      throw error;
    }
  }

  /**
   * Create new dogcatcher
   * @param {object} data - DogCatcher data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO dog_catcher (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating dogcatcher', error);
      throw error;
    }
  }

  /**
   * Update dogcatcher
   * @param {number} catcher_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(catcher_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), catcher_id];

      const [result] = await pool.query(
        `UPDATE dog_catcher SET ${fields} WHERE catcher_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating dogcatcher', error);
      throw error;
    }
  }

  /**
   * Delete dogcatcher
   * @param {number} catcher_id
   * @returns {Promise<object>}
   */
  static async delete(catcher_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM dog_catcher WHERE catcher_id = ?',
        [catcher_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting dogcatcher', error);
      throw error;
    }
  }

  /**
   * Count total dogcatchers
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM dog_catcher');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting dogcatchers', error);
      throw error;
    }
  }
}

export default DogCatcher;
