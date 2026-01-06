import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ADMIN_MODEL');

class Admin {
  /**
   * Find admin by id
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM admin WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding admin by id', error);
      throw error;
    }
  }

  /**
   * Get all admins
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM admin');
      return rows;
    } catch (error) {
      logger.error('Error getting all admins', error);
      throw error;
    }
  }

  /**
   * Create new admin
   * @param {object} data - Admin data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO admin (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating admin', error);
      throw error;
    }
  }

  /**
   * Update admin
   * @param {number} id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const [result] = await pool.query(
        `UPDATE admin SET ${fields} WHERE id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating admin', error);
      throw error;
    }
  }

  /**
   * Delete admin
   * @param {number} id
   * @returns {Promise<object>}
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM admin WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting admin', error);
      throw error;
    }
  }

  /**
   * Count total admins
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting admins', error);
      throw error;
    }
  }
}

export default Admin;
