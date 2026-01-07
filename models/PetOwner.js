import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PETOWNER_MODEL');

class PetOwner {
  /**
   * Find petowner by owner_id
   * @param {number} owner_id
   * @returns {Promise<object|null>}
   */
  static async findById(owner_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM pet_owner WHERE owner_id = ?',
        [owner_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding petowner by owner_id', error);
      throw error;
    }
  }

  /**
   * Get all petowners
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM pet_owner');
      return rows;
    } catch (error) {
      logger.error('Error getting all petowners', error);
      throw error;
    }
  }

  /**
   * Create new petowner
   * @param {object} data - PetOwner data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO pet_owner (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating petowner', error);
      throw error;
    }
  }

  /**
   * Update petowner
   * @param {number} owner_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(owner_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), owner_id];

      const [result] = await pool.query(
        `UPDATE pet_owner SET ${fields} WHERE owner_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating petowner', error);
      throw error;
    }
  }

  /**
   * Delete petowner
   * @param {number} owner_id
   * @returns {Promise<object>}
   */
  static async delete(owner_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM pet_owner WHERE owner_id = ?',
        [owner_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting petowner', error);
      throw error;
    }
  }

  /**
   * Count total petowners
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM pet_owner');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting petowners', error);
      throw error;
    }
  }
}

export default PetOwner;
