import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PRIVATECLINIC_MODEL');

class PrivateClinic {
  /**
   * Find privateclinic by clinic_id
   * @param {number} clinic_id
   * @returns {Promise<object|null>}
   */
  static async findById(clinic_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM private_clinic WHERE clinic_id = ?',
        [clinic_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding privateclinic by clinic_id', error);
      throw error;
    }
  }

  /**
   * Get all privateclinics
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM private_clinic');
      return rows;
    } catch (error) {
      logger.error('Error getting all privateclinics', error);
      throw error;
    }
  }

  /**
   * Create new privateclinic
   * @param {object} data - PrivateClinic data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO private_clinic (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating privateclinic', error);
      throw error;
    }
  }

  /**
   * Update privateclinic
   * @param {number} clinic_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(clinic_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), clinic_id];

      const [result] = await pool.query(
        `UPDATE private_clinic SET ${fields} WHERE clinic_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating privateclinic', error);
      throw error;
    }
  }

  /**
   * Delete privateclinic
   * @param {number} clinic_id
   * @returns {Promise<object>}
   */
  static async delete(clinic_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM private_clinic WHERE clinic_id = ?',
        [clinic_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting privateclinic', error);
      throw error;
    }
  }

  /**
   * Count total privateclinics
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM private_clinic');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting privateclinics', error);
      throw error;
    }
  }
}

export default PrivateClinic;
