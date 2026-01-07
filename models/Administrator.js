import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ADMINISTRATOR_MODEL');

class Administrator {
  /**
   * Find administrator by admin_id
   * @param {number} admin_id
   * @returns {Promise<object|null>}
   */
  static async findById(admin_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM administrator WHERE admin_id = ?',
        [admin_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding administrator by admin_id', error);
      throw error;
    }
  }

  /**
   * Get all administrators
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM administrator');
      return rows;
    } catch (error) {
      logger.error('Error getting all administrators', error);
      throw error;
    }
  }

  /**
   * Create new administrator
   * @param {object} data - Administrator data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO administrator (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating administrator', error);
      throw error;
    }
  }

  /**
   * Update administrator
   * @param {number} admin_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(admin_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), admin_id];

      const [result] = await pool.query(
        `UPDATE administrator SET ${fields} WHERE admin_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating administrator', error);
      throw error;
    }
  }

  /**
   * Delete administrator
   * @param {number} admin_id
   * @returns {Promise<object>}
   */
  static async delete(admin_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM administrator WHERE admin_id = ?',
        [admin_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting administrator', error);
      throw error;
    }
  }

  /**
   * Count total administrators
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM administrator');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting administrators', error);
      throw error;
    }
  }
}

export default Administrator;
