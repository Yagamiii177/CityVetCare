import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PATROL-SCHEDULE-MODEL');

class PatrolSchedule {
  /**
   * Get all patrol schedules with optional filters
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          ps.schedule_id as id,
          ps.report_id as incident_id,
          ps.assigned_catcher_id,
          ps.schedule_date,
          ps.schedule_time,
          ps.status,
          ps.notes,
          ps.created_at,
          ps.updated_at,
          ir.description as incident_title,
          ir.description as incident_description,
          ir.status as incident_status,
          il.address_text as incident_location,
          dc.full_name as assigned_staff_names,
          CONCAT(ps.assigned_catcher_id) as assigned_staff_ids
        FROM patrol_schedule ps
        LEFT JOIN incident_report ir ON ps.report_id = ir.report_id
        LEFT JOIN incident_location il ON ir.location_id = il.location_id
        LEFT JOIN dog_catcher dc ON ps.assigned_catcher_id = dc.catcher_id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.status) {
        query += ' AND ps.status = ?';
        params.push(filters.status);
      }
      if (filters.incident_id) {
        query += ' AND ps.report_id = ?';
        params.push(filters.incident_id);
      }
      
      query += ' ORDER BY ps.schedule_date DESC, ps.schedule_time DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error in PatrolSchedule.getAll', error);
      throw error;
    }
  }

  /**
   * Get single patrol schedule by ID
   */
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          ps.schedule_id as id,
          ps.report_id as incident_id,
          ps.assigned_catcher_id,
          ps.schedule_date,
          ps.schedule_time,
          ps.status,
          ps.notes,
          ps.created_at,
          ps.updated_at,
          ir.description as incident_title,
          ir.description as incident_description,
          il.address_text as incident_location,
          dc.full_name as assigned_staff_names,
          CONCAT(ps.assigned_catcher_id) as assigned_staff_ids
        FROM patrol_schedule ps
        LEFT JOIN incident_report ir ON ps.report_id = ir.report_id
        LEFT JOIN incident_location il ON ir.location_id = il.location_id
        LEFT JOIN dog_catcher dc ON ps.assigned_catcher_id = dc.catcher_id
        WHERE ps.schedule_id = ?`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      logger.error('Error in PatrolSchedule.getById', error);
      throw error;
    }
  }

  /**
   * Get schedules by incident ID
   */
  static async getByIncidentId(incidentId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          ps.schedule_id as id,
          ps.report_id as incident_id,
          ps.assigned_catcher_id,
          ps.schedule_date,
          ps.schedule_time,
          ps.status,
          ps.notes,
          ps.created_at,
          ps.updated_at,
          dc.full_name as assigned_staff_names,
          CONCAT(ps.assigned_catcher_id) as assigned_staff_ids
        FROM patrol_schedule ps
        LEFT JOIN dog_catcher dc ON ps.assigned_catcher_id = dc.catcher_id
        WHERE ps.report_id = ?
        ORDER BY ps.schedule_date DESC`,
        [incidentId]
      );
      
      return rows;
    } catch (error) {
      logger.error('Error in PatrolSchedule.getByIncidentId', error);
      throw error;
    }
  }

  /**
   * Create new patrol schedule
   */
  static async create(data) {
    try {
      // Extract first staff ID if multiple provided (comma-separated)
      const staffIds = data.assigned_staff_ids || '';
      const firstStaffId = staffIds.toString().split(',')[0];
      
      const [result] = await pool.execute(
        `INSERT INTO patrol_schedule 
         (report_id, assigned_catcher_id, schedule_date, schedule_time, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.incident_id,
          firstStaffId || null,
          data.schedule_date,
          data.schedule_time || null,
          data.status || 'scheduled',
          data.notes || null
        ]
      );
      
      return {
        id: result.insertId,
        incident_id: data.incident_id,
        assigned_catcher_id: firstStaffId,
        assigned_staff_ids: data.assigned_staff_ids,
        assigned_staff_names: data.assigned_staff_names,
        schedule_date: data.schedule_date,
        schedule_time: data.schedule_time,
        status: data.status || 'scheduled',
        notes: data.notes
      };
    } catch (error) {
      logger.error('Error in PatrolSchedule.create', error);
      throw error;
    }
  }

  /**
   * Update patrol schedule
   */
  static async update(id, data) {
    try {
      const fields = [];
      const params = [];
      
      if (data.assigned_staff_ids) {
        // Extract first staff ID if multiple provided
        const staffIds = data.assigned_staff_ids.toString().split(',')[0];
        fields.push('assigned_catcher_id = ?');
        params.push(staffIds);
      }
      if (data.schedule_date) {
        fields.push('schedule_date = ?');
        params.push(data.schedule_date);
      }
      if (data.schedule_time) {
        fields.push('schedule_time = ?');
        params.push(data.schedule_time);
      }
      if (data.status) {
        fields.push('status = ?');
        params.push(data.status);
      }
      if (data.notes !== undefined) {
        fields.push('notes = ?');
        params.push(data.notes);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      params.push(id);
      
      const [result] = await pool.execute(
        `UPDATE patrol_schedule SET ${fields.join(', ')} WHERE schedule_id = ?`,
        params
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error in PatrolSchedule.update', error);
      throw error;
    }
  }

  /**
   * Delete patrol schedule
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM patrol_schedule WHERE schedule_id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error in PatrolSchedule.delete', error);
      throw error;
    }
  }
}

export default PatrolSchedule;
