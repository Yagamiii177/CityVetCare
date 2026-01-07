import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('INCIDENTREPORT_MODEL');

class IncidentReport {
  /**
   * Find incidentreport by report_id
   * @param {number} report_id
   * @returns {Promise<object|null>}
   */
  static async findById(report_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM incident_report WHERE report_id = ?',
        [report_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding incidentreport by report_id', error);
      throw error;
    }
  }

  /**
   * Get all incidentreports
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM incident_report');
      return rows;
    } catch (error) {
      logger.error('Error getting all incidentreports', error);
      throw error;
    }
  }

  /**
   * Create new incidentreport
   * @param {object} data - IncidentReport data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO incident_report (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating incidentreport', error);
      throw error;
    }
  }

  /**
   * Update incidentreport
   * @param {number} report_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(report_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), report_id];

      const [result] = await pool.query(
        `UPDATE incident_report SET ${fields} WHERE report_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating incidentreport', error);
      throw error;
    }
  }

  /**
   * Delete incidentreport
   * @param {number} report_id
   * @returns {Promise<object>}
   */
  static async delete(report_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM incident_report WHERE report_id = ?',
        [report_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting incidentreport', error);
      throw error;
    }
  }

  /**
   * Count total incidentreports
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM incident_report');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting incidentreports', error);
      throw error;
    }
  }
}

export default IncidentReport;
