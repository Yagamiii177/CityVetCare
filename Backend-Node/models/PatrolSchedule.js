import { pool } from '../config/database.js';

class PatrolSchedule {
  /**
   * Get all patrol schedules with optional filters using stored procedure
   */
  static async getAll(filters = {}) {
    try {
      const [rows] = await pool.execute(
        'CALL sp_patrol_schedules_get_all(?, ?, ?, ?)',
        [
          filters.status || null,
          filters.incident_id || null,
          filters.limit || 1000,
          filters.offset || 0
        ]
      );
      
      const schedules = rows[0];
      return schedules.map(row => ({
        ...row,
        assigned_staff_ids: row.assigned_staff_ids ? 
          (typeof row.assigned_staff_ids === 'string' ? JSON.parse(row.assigned_staff_ids) : row.assigned_staff_ids) : []
      }));
    } catch (error) {
      console.error('Error in PatrolSchedule.getAll:', error);
      throw error;
    }
  }

  /**
   * Get single patrol schedule by ID using stored procedure
   */
  static async getById(id) {
    try {
      const [rows] = await pool.execute('CALL sp_patrol_schedules_get_by_id(?)', [id]);
      
      if (!rows[0] || rows[0].length === 0) {
        return null;
      }

      const schedule = rows[0][0];
      return schedule;
    } catch (error) {
      console.error('Error in PatrolSchedule.getById:', error);
      throw error;
    }
  }

  /**
   * Get schedules by incident ID using stored procedure
   */
  static async getByIncidentId(incidentId) {
    try {
      const [rows] = await pool.execute('CALL sp_patrol_schedules_get_by_incident(?)', [incidentId]);
      
      const schedules = rows[0];
      return schedules;
    } catch (error) {
      console.error('Error in PatrolSchedule.getByIncidentId:', error);
      throw error;
    }
  }

  /**
   * Create new patrol schedule using stored procedure
   */
  static async create(data) {
    try {
      const [result] = await pool.execute(
        'CALL sp_patrol_schedules_create(?, ?, ?, ?, ?, ?, ?)',
        [
          data.catcher_team_id,
          data.incident_id || null,
          data.scheduled_date,
          data.scheduled_time,
          data.end_time || null,
          data.status || 'scheduled',
          data.notes || null
        ]
      );

      const insertId = result[0][0].id;
      return { id: insertId, ...data };
    } catch (error) {
      console.error('Error in PatrolSchedule.create:', error);
      throw error;
    }
  }

  /**
   * Update patrol schedule using stored procedure
   */
  static async update(id, data) {
    try {
      const [result] = await pool.execute(
        'CALL sp_patrol_schedules_update(?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.catcher_team_id || null,
          data.incident_id || null,
          data.scheduled_date || null,
          data.scheduled_time || null,
          data.end_time || null,
          data.status || null,
          data.notes || null
        ]
      );

      return result[0][0].affected_rows > 0;
    } catch (error) {
      console.error('Error in PatrolSchedule.update:', error);
      throw error;
    }
  }

  /**
   * Delete patrol schedule using stored procedure
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('CALL sp_patrol_schedules_delete(?)', [id]);
      return result[0][0].affected_rows > 0;
    } catch (error) {
      console.error('Error in PatrolSchedule.delete:', error);
      throw error;
    }
  }
}

export default PatrolSchedule;
