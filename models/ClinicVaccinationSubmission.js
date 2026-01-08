import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('CLINICVACCINATIONSUBMISSION_MODEL');

class ClinicVaccinationSubmission {
  /**
   * Find clinicvaccinationsubmission by submission_id
   * @param {number} submission_id
   * @returns {Promise<object|null>}
   */
  static async findById(submission_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM clinic_vaccination_submission WHERE submission_id = ?',
        [submission_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding clinicvaccinationsubmission by submission_id', error);
      throw error;
    }
  }

  /**
   * Get all clinicvaccinationsubmissions
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM clinic_vaccination_submission');
      return rows;
    } catch (error) {
      logger.error('Error getting all clinicvaccinationsubmissions', error);
      throw error;
    }
  }

  /**
   * Create new clinicvaccinationsubmission
   * @param {object} data - ClinicVaccinationSubmission data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO clinic_vaccination_submission (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating clinicvaccinationsubmission', error);
      throw error;
    }
  }

  /**
   * Update clinicvaccinationsubmission
   * @param {number} submission_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(submission_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), submission_id];

      const [result] = await pool.query(
        `UPDATE clinic_vaccination_submission SET ${fields} WHERE submission_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating clinicvaccinationsubmission', error);
      throw error;
    }
  }

  /**
   * Delete clinicvaccinationsubmission
   * @param {number} submission_id
   * @returns {Promise<object>}
   */
  static async delete(submission_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM clinic_vaccination_submission WHERE submission_id = ?',
        [submission_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting clinicvaccinationsubmission', error);
      throw error;
    }
  }

  /**
   * Count total clinicvaccinationsubmissions
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM clinic_vaccination_submission');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting clinicvaccinationsubmissions', error);
      throw error;
    }
  }
}

export default ClinicVaccinationSubmission;
