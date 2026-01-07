import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PATROL-STAFF-MODEL');

class PatrolStaff {
  /**
   * Get all patrol staff with optional filters
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          catcher_id as id,
          full_name as team_name,
          full_name as leader_name,
          contact_number,
          'active' as availability
        FROM dog_catcher
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.availability) {
        query += ' AND ? = ?';
        params.push('active', filters.availability);
      }
      
      query += ' ORDER BY full_name';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error in PatrolStaff.getAll', error);
      throw error;
    }
  }

  /**
   * Get single patrol staff by ID
   */
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          catcher_id as id,
          full_name as team_name,
          full_name as leader_name,
          contact_number,
          'active' as availability
        FROM dog_catcher 
        WHERE catcher_id = ?`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      logger.error('Error in PatrolStaff.getById', error);
      throw error;
    }
  }

  /**
   * Create new patrol staff
   */
  static async create(data) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO dog_catcher (full_name, contact_number) 
         VALUES (?, ?)`,
        [data.name || data.team_name, data.contact_number]
      );
      
      return {
        id: result.insertId,
        team_name: data.name || data.team_name,
        leader_name: data.name || data.team_name,
        contact_number: data.contact_number,
        availability: 'active'
      };
    } catch (error) {
      logger.error('Error in PatrolStaff.create', error);
      throw error;
    }
  }

  /**
   * Update patrol staff
   */
  static async update(id, data) {
    try {
      const fields = [];
      const params = [];
      
      if (data.name || data.team_name) {
        fields.push('full_name = ?');
        params.push(data.name || data.team_name);
      }
      if (data.contact_number) {
        fields.push('contact_number = ?');
        params.push(data.contact_number);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      params.push(id);
      
      const [result] = await pool.execute(
        `UPDATE dog_catcher SET ${fields.join(', ')} WHERE catcher_id = ?`,
        params
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error in PatrolStaff.update', error);
      throw error;
    }
  }

  /**
   * Delete patrol staff
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM dog_catcher WHERE catcher_id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error in PatrolStaff.delete', error);
      throw error;
    }
  }
}

export default PatrolStaff;
