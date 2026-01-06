import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('INCIDENT_MODEL');

class Incident {
  /**
   * Get all incidents with optional filters
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          i.*,
          ct.team_name as catcher_team_name,
          s.scheduled_date,
          s.scheduled_time,
          s.status as schedule_status
        FROM incidents i
        LEFT JOIN schedules s ON i.id = s.incident_id AND s.status != 'cancelled'
        LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.status) {
        query += ' AND i.status = ?';
        params.push(filters.status);
      }
      
      if (filters.incident_type) {
        query += ' AND i.incident_type = ?';
        params.push(filters.incident_type);
      }
      
      if (filters.search) {
        query += ` AND (
          i.title LIKE ? OR 
          i.description LIKE ? OR 
          i.location LIKE ? OR 
          i.reporter_name LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      query += ' ORDER BY i.created_at DESC';
      
      if (filters.limit) {
        query += ' LIMIT ? OFFSET ?';
        params.push(filters.limit, filters.offset || 0);
      }
      
      const [rows] = await pool.execute(query, params);
      
      return rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));
    } catch (error) {
      logger.error('Failed to get all incidents', error);
      throw error;
    }
  }

  /**
   * Get single incident by ID
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          i.*,
          ct.team_name as catcher_team_name,
          s.scheduled_date,
          s.scheduled_time,
          s.status as schedule_status
        FROM incidents i
        LEFT JOIN schedules s ON i.id = s.incident_id AND s.status != 'cancelled'
        LEFT JOIN catcher_teams ct ON s.catcher_team_id = ct.id
        WHERE i.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const incident = rows[0];
      return {
        ...incident,
        images: incident.images ? JSON.parse(incident.images) : []
      };
    } catch (error) {
      logger.error('Failed to get incident by ID', error);
      throw error;
    }
  }

  /**
   * Create new incident
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO incidents (
          title, description, location, latitude, longitude,
          status, incident_type, animal_type,
          pet_breed, pet_color, pet_gender, pet_size,
          reporter_name, reporter_contact, reporter_address,
          images, incident_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        data.title || 'Incident Report',
        data.description,
        data.location,
        data.latitude || null,
        data.longitude || null,
        data.status || 'pending',
        data.incident_type || 'incident',
        data.animal_type || null,
        data.pet_breed || null,
        data.pet_color || null,
        data.pet_gender || null,
        data.pet_size || null,
        data.reporter_name,
        data.reporter_contact,
        data.reporter_address || null,
        data.images ? JSON.stringify(data.images) : null,
        data.incident_date || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ];
      
      const [result] = await pool.execute(query, params);
      return result.insertId;
    } catch (error) {
      logger.error('Failed to create incident', error);
      throw error;
    }
  }

  /**
   * Update incident
   */
  static async update(id, data) {
    try {
      const fields = [];
      const params = [];
      
      if (data.title !== undefined) {
        fields.push('title = ?');
        params.push(data.title);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        params.push(data.description);
      }
      if (data.location !== undefined) {
        fields.push('location = ?');
        params.push(data.location);
      }
      if (data.latitude !== undefined) {
        fields.push('latitude = ?');
        params.push(data.latitude);
      }
      if (data.longitude !== undefined) {
        fields.push('longitude = ?');
        params.push(data.longitude);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        params.push(data.status);
        
        // If resolved, set resolved_at
        if (data.status === 'resolved') {
          fields.push('resolved_at = ?');
          params.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
        }
      }
      if (data.incident_type !== undefined) {
        fields.push('incident_type = ?');
        params.push(data.incident_type);
      }
      if (data.animal_type !== undefined) {
        fields.push('animal_type = ?');
        params.push(data.animal_type);
      }
      if (data.assigned_catcher_id !== undefined) {
        fields.push('assigned_catcher_id = ?');
        params.push(data.assigned_catcher_id);
      }
      if (data.assigned_staff_name !== undefined) {
        fields.push('assigned_staff_name = ?');
        params.push(data.assigned_staff_name);
      }
      if (data.images !== undefined) {
        fields.push('images = ?');
        params.push(JSON.stringify(data.images));
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      params.push(id);
      const query = `UPDATE incidents SET ${fields.join(', ')} WHERE id = ?`;
      
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Failed to update incident', error);
      throw error;
    }
  }

  /**
   * Delete incident
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM incidents WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Failed to delete incident', error);
      throw error;
    }
  }

  /**
   * Get count by status
   */
  static async getCountsByStatus() {
    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM incidents
        GROUP BY status
      `;
      
      const [rows] = await pool.execute(query);
      
      const counts = {
        pending: 0,
        verified: 0,
        in_progress: 0,
        assigned: 0,
        scheduled: 0,
        resolved: 0,
        cancelled: 0,
        total: 0
      };
      
      rows.forEach(row => {
        counts[row.status] = parseInt(row.count);
        counts.total += parseInt(row.count);
      });
      
      return counts;
    } catch (error) {
      logger.error('Failed to get counts by status', error);
      throw error;
    }
  }
}

export default Incident;
