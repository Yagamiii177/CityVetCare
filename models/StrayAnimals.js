import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('STRAYANIMALS_MODEL');

class StrayAnimals {
  /**
   * Find strayanimals by animal_id
   * @param {number} animal_id
   * @returns {Promise<object|null>}
   */
  static async findById(animal_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM stray_animals WHERE animal_id = ?',
        [animal_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding strayanimals by animal_id', error);
      throw error;
    }
  }

  /**
   * Get all strayanimalss
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM stray_animals');
      return rows;
    } catch (error) {
      logger.error('Error getting all strayanimalss', error);
      throw error;
    }
  }

  /**
   * Create new strayanimals
   * @param {object} data - StrayAnimals data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO stray_animals (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating strayanimals', error);
      throw error;
    }
  }

  /**
   * Update strayanimals
   * @param {number} animal_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(animal_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), animal_id];

      const [result] = await pool.query(
        `UPDATE stray_animals SET ${fields} WHERE animal_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating strayanimals', error);
      throw error;
    }
  }

  /**
   * Delete strayanimals
   * @param {number} animal_id
   * @returns {Promise<object>}
   */
  static async delete(animal_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM stray_animals WHERE animal_id = ?',
        [animal_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting strayanimals', error);
      throw error;
    }
  }

  /**
   * Count total strayanimalss
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM stray_animals');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting strayanimalss', error);
      throw error;
    }
  }
}

export default StrayAnimals;
