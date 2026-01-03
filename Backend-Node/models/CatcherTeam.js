import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('CATCHER-TEAM-MODEL');

class CatcherTeam {
  /**
   * Get all catcher teams with optional filters using stored procedure
   */
  static async getAll(filters = {}) {
    try {
      const [rows] = await pool.execute(
        'CALL sp_catchers_get_all(?, ?, ?)',
        [
          filters.status || null,
          filters.limit || 1000,
          filters.offset || 0
        ]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error in CatcherTeam.getAll', error);
      throw error;
    }
  }

  /**
   * Get single catcher team by ID using stored procedure
   */
  static async getById(id) {
    try {
      const [rows] = await pool.execute('CALL sp_catchers_get_by_id(?)', [id]);
      return (rows[0] && rows[0].length > 0) ? rows[0][0] : null;
    } catch (error) {
      logger.error('Error in CatcherTeam.getById', error);
      throw error;
    }
  }

  /**
   * Create new catcher team using stored procedure
   */
  static async create(data) {
    try {
      const [result] = await pool.execute(
        'CALL sp_catchers_create(?, ?, ?, ?, ?, ?)',
        [
          data.team_name,
          data.leader_name,
          data.contact_number,
          data.vehicle_number || null,
          data.status || 'available',
          data.specialization || null
        ]
      );

      const insertId = result[0][0].id;
      return { id: insertId, ...data };
    } catch (error) {
      logger.error('Error in CatcherTeam.create', error);
      throw error;
    }
  }

  /**
   * Update catcher team using stored procedure
   */
  static async update(id, data) {
    try {
      const [result] = await pool.execute(
        'CALL sp_catchers_update(?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.team_name || null,
          data.leader_name || null,
          data.contact_number || null,
          data.vehicle_number || null,
          data.status || null,
          data.specialization || null
        ]
      );

      return result[0][0].affected_rows > 0;
    } catch (error) {
      logger.error('Error in CatcherTeam.update', error);
      throw error;
    }
  }

  /**
   * Delete catcher team using stored procedure
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('CALL sp_catchers_delete(?)', [id]);
      return result[0][0].affected_rows > 0;
    } catch (error) {
      logger.error('Error in CatcherTeam.delete', error);
      throw error;
    }
  }

  /**
   * Get available catcher teams for assignment
   */
  static async getAvailable() {
    try {
      const [rows] = await pool.execute('CALL sp_catchers_get_available()');
      return rows[0];
    } catch (error) {
      logger.error('Error in CatcherTeam.getAvailable', error);
      throw error;
    }
  }
}

export default CatcherTeam;
