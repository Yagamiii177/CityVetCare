import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PET_MODEL');

class Pet {
  /**
   * Find pet by pet_id
   * @param {number} pet_id
   * @returns {Promise<object|null>}
   */
  static async findById(pet_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM pet WHERE pet_id = ?',
        [pet_id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding pet by pet_id', error);
      throw error;
    }
  }

  /**
   * Get all pets
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM pet');
      return rows;
    } catch (error) {
      logger.error('Error getting all pets', error);
      throw error;
    }
  }

  /**
   * Create new pet
   * @param {object} data - Pet data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO pet (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating pet', error);
      throw error;
    }
  }

  /**
   * Update pet
   * @param {number} pet_id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(pet_id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), pet_id];

      const [result] = await pool.query(
        `UPDATE pet SET ${fields} WHERE pet_id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating pet', error);
      throw error;
    }
  }

  /**
   * Delete pet
   * @param {number} pet_id
   * @returns {Promise<object>}
   */
  static async delete(pet_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM pet WHERE pet_id = ?',
        [pet_id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting pet', error);
      throw error;
    }
  }

  /**
   * Count total pets
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM pet');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting pets', error);
      throw error;
    }
  }
}

export default Pet;
