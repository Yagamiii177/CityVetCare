import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('REDEMPTIONREQUEST_MODEL');

class RedemptionRequest {
  /**
   * Find redemptionrequest by redemption_id
   * @param {number} redemption_id
   * @returns {Promise<object|null>}
   */
  static async findById(redemption_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM redemption_request WHERE redemption_id = ?',
        [redemption_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding redemptionrequest by redemption_id', error);
      throw error;
    }
  }

  /**
   * Get all redemptionrequests
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM redemption_request');
      return rows;
    } catch (error) {
      logger.error('Error getting all redemptionrequests', error);
      throw error;
    }
  }

  /**
   * Create new redemptionrequest
   * @param {object} data - RedemptionRequest data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO redemption_request (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating redemptionrequest', error);
      throw error;
    }
  }

  /**
   * Update redemptionrequest
   * @param {number} redemption_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(redemption_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), redemption_id];

      const [result] = await pool.query(
        `UPDATE redemption_request SET ${fields} WHERE redemption_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating redemptionrequest', error);
      throw error;
    }
  }

  /**
   * Delete redemptionrequest
   * @param {number} redemption_id
   * @returns {Promise<object>}
   */
  static async delete(redemption_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM redemption_request WHERE redemption_id = ?',
        [redemption_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting redemptionrequest', error);
      throw error;
    }
  }

  /**
   * Count total redemptionrequests
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM redemption_request');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting redemptionrequests', error);
      throw error;
    }
  }
}

export default RedemptionRequest;
