import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PERSON_MODEL');

class Person {
  /**
   * Find person by id
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM person WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding person by id', error);
      throw error;
    }
  }

  /**
   * Get all persons
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM person');
      return rows;
    } catch (error) {
      logger.error('Error getting all persons', error);
      throw error;
    }
  }

  /**
   * Create new person
   * @param {object} data - Person data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        `INSERT INTO person (${fields}) VALUES (${placeholders})`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating person', error);
      throw error;
    }
  }

  /**
   * Update person
   * @param {number} id
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(id, data) {
    try {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const [result] = await pool.query(
        `UPDATE person SET ${fields} WHERE id = ?`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating person', error);
      throw error;
    }
  }

  /**
   * Delete person
   * @param {number} id
   * @returns {Promise<object>}
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM person WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting person', error);
      throw error;
    }
  }

  /**
   * Count total persons
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM person');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting persons', error);
      throw error;
    }
  }
}

export default Person;
