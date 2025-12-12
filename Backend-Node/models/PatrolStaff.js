import { pool } from '../config/database.js';

class PatrolStaff {
  /**
   * Get all patrol staff with optional filters using stored procedure
   */
  static async getAll(filters = {}) {
    try {
      const [rows] = await pool.execute(
        'CALL sp_patrol_staff_get_all(?, ?, ?)',
        [
          filters.status || null,
          filters.limit || 1000,
          filters.offset || 0
        ]
      );
      return rows[0];
    } catch (error) {
      console.error('Error in PatrolStaff.getAll:', error);
      throw error;
    }
  }

  /**
   * Get single patrol staff by ID using stored procedure
   */
  static async getById(id) {
    try {
      const [rows] = await pool.execute('CALL sp_patrol_staff_get_by_id(?)', [id]);
      return (rows[0] && rows[0].length > 0) ? rows[0][0] : null;
    } catch (error) {
      console.error('Error in PatrolStaff.getById:', error);
      throw error;
    }
  }

  /**
   * Create new patrol staff using stored procedure
   */
  static async create(data) {
    try {
      const [result] = await pool.execute(
        'CALL sp_patrol_staff_create(?, ?, ?, ?, ?, ?)',
        [
          data.team_name || data.name,
          data.leader_name || data.name,
          data.contact_number || data.contact,
          data.email || null,
          data.status || data.availability || 'active',
          data.members_count || 1
        ]
      );

      const insertId = result[0][0].id;
      return { id: insertId, ...data };
    } catch (error) {
      console.error('Error in PatrolStaff.create:', error);
      throw error;
    }
  }

  /**
   * Update patrol staff using stored procedure
   */
  static async update(id, data) {
    try {
      const [result] = await pool.execute(
        'CALL sp_patrol_staff_update(?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.team_name || data.name || null,
          data.leader_name || data.name || null,
          data.contact_number || data.contact || null,
          data.email || null,
          data.status || data.availability || null,
          data.members_count || null
        ]
      );

      return result[0][0].affected_rows > 0;
    } catch (error) {
      console.error('Error in PatrolStaff.update:', error);
      throw error;
    }
  }

  /**
   * Delete patrol staff using stored procedure
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('CALL sp_patrol_staff_delete(?)', [id]);
      return result[0][0].affected_rows > 0;
    } catch (error) {
      console.error('Error in PatrolStaff.delete:', error);
      throw error;
    }
  }
}

export default PatrolStaff;
