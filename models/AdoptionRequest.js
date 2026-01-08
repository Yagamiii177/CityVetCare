import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ADOPTIONREQUEST_MODEL');

class AdoptionRequest {
  /**
   * Find adoptionrequest by adoption_id
   * @param {number} adoption_id
   * @returns {Promise<object|null>}
   */
  static async findById(adoption_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM adoption_request WHERE adoption_id = ?',
        [adoption_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding adoptionrequest by adoption_id', error);
      throw error;
    }
  }

  /**
   * Get all adoptionrequests
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM adoption_request');
      return rows;
    } catch (error) {
      logger.error('Error getting all adoptionrequests', error);
      throw error;
    }
  }

  /**
   * Create new adoptionrequest
   * @param {object} data - AdoptionRequest data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO adoption_request (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating adoptionrequest', error);
      throw error;
    }
  }

  /**
   * Update adoptionrequest
   * @param {number} adoption_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(adoption_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), adoption_id];

      const [result] = await pool.query(
        `UPDATE adoption_request SET ${fields} WHERE adoption_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating adoptionrequest', error);
      throw error;
    }
  }

  /**
   * Delete adoptionrequest
   * @param {number} adoption_id
   * @returns {Promise<object>}
   */
  static async delete(adoption_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM adoption_request WHERE adoption_id = ?',
        [adoption_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting adoptionrequest', error);
      throw error;
    }
  }

  /**
   * Count total adoptionrequests
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM adoption_request');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting adoptionrequests', error);
      throw error;
    }
  }
}

export default AdoptionRequest;
