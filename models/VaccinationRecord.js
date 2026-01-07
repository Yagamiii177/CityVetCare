import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('VACCINATIONRECORD_MODEL');

class VaccinationRecord {
  /**
   * Find vaccinationrecord by record_id
   * @param {number} record_id
   * @returns {Promise<object|null>}
   */
  static async findById(record_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM vaccination_record WHERE record_id = ?',
        [record_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding vaccinationrecord by record_id', error);
      throw error;
    }
  }

  /**
   * Get all vaccinationrecords
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM vaccination_record');
      return rows;
    } catch (error) {
      logger.error('Error getting all vaccinationrecords', error);
      throw error;
    }
  }

  /**
   * Create new vaccinationrecord
   * @param {object} data - VaccinationRecord data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO vaccination_record (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating vaccinationrecord', error);
      throw error;
    }
  }

  /**
   * Update vaccinationrecord
   * @param {number} record_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(record_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), record_id];

      const [result] = await pool.query(
        `UPDATE vaccination_record SET ${fields} WHERE record_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating vaccinationrecord', error);
      throw error;
    }
  }

  /**
   * Delete vaccinationrecord
   * @param {number} record_id
   * @returns {Promise<object>}
   */
  static async delete(record_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM vaccination_record WHERE record_id = ?',
        [record_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting vaccinationrecord', error);
      throw error;
    }
  }

  /**
   * Count total vaccinationrecords
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM vaccination_record');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting vaccinationrecords', error);
      throw error;
    }
  }
}

export default VaccinationRecord;
