import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('INCIDENT-MODEL');

class Incident {
  /**
   * Get all incidents with optional filters using stored procedure
   */
  static async getAll(filters = {}) {
    try {
      const [rows] = await pool.execute(
        'CALL sp_incidents_get_all(?, ?, ?, ?, ?)',
        [
          filters.status || null,
          filters.incident_type || null,
          filters.search || null,
          filters.limit || 1000,
          filters.offset || 0
        ]
      );
      
      // MySQL stored procedure returns array of result sets
      const incidents = rows[0];
      
      // Parse JSON fields
      return incidents.map(row => ({
        ...row,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
      }));
    } catch (error) {
      logger.error('Failed to get all incidents', error);
      throw error;
    }
  }

  /**
   * Get single incident by ID using stored procedure
   */
  static async getById(id) {
    try {
      const [rows] = await pool.execute('CALL sp_incidents_get_by_id(?)', [id]);
      
      if (!rows[0] || rows[0].length === 0) {
        return null;
      }

      const incident = rows[0][0];
      return {
        ...incident,
        images: incident.images ? (typeof incident.images === 'string' ? JSON.parse(incident.images) : incident.images) : []
      };
    } catch (error) {
      logger.error('Failed to get incident by ID', error);
      throw error;
    }
  }

  /**
   * Get count of incidents by status using stored procedure
   */
  static async getCountsByStatus() {
    try {
      const [rows] = await pool.execute('CALL sp_incidents_count_by_status()');
      return rows[0]; // Returns array of {status, count} objects
    } catch (error) {
      logger.error('Failed to get counts by status', error);
      throw error;
    }
  }

  /**
   * Create new incident using stored procedure
   */
  static async create(data) {
    try {
      // Clean and validate incident_type - never allow empty string
      let incidentType = data.incident_type || data.reportType || null;
      if (incidentType === '') incidentType = null;
      if (!incidentType) incidentType = 'incident';
      
      // Handle images - check if already stringified to avoid double-stringifying
      let imagesData = null;
      if (data.images) {
        if (typeof data.images === 'string') {
          // Already a JSON string from mobile app
          imagesData = data.images;
        } else {
          // Array or object needs stringifying (from web app)
          imagesData = JSON.stringify(data.images);
        }
      }
      
      const [result] = await pool.execute(
        'CALL sp_incidents_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          data.reporter_name || 'Anonymous',
          data.reporter_contact || data.contactNumber || '',
          data.title || 'Incident Report',
          data.description || '',
          data.location,
          data.latitude || null,
          data.longitude || null,
          data.incident_date || data.date || null,
          data.status || 'pending',
          imagesData,
          data.assigned_catcher_id || null,
          incidentType,
          data.pet_color || data.petColor || null,
          data.pet_breed || data.petBreed || null,
          data.animal_type || data.animalType || null,
          data.pet_gender || data.petGender || null,
          data.pet_size || data.petSize || null
        ]
      );

      const insertId = result[0][0].id;  // Fixed: changed from incident_id to id
      return { id: insertId, ...data };
    } catch (error) {
      logger.error('Failed to create incident', error);
      throw error;
    }
  }

  /**
   * Update incident using stored procedure
   */
  static async update(id, data) {
    try {
      // Handle images - check if already stringified to avoid double-stringifying
      let imagesData = null;
      if (data.images !== undefined) {
        if (data.images === null) {
          imagesData = null;
        } else if (typeof data.images === 'string') {
          // Already a JSON string from mobile app
          imagesData = data.images;
        } else {
          // Array or object needs stringifying (from web app)
          imagesData = JSON.stringify(data.images);
        }
      }
      
      const [result] = await pool.execute(
        'CALL sp_incidents_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.reporter_name ?? null,
          data.reporter_contact ?? null,
          data.title ?? null,
          data.description ?? null,
          data.location ?? null,
          data.latitude ?? null,
          data.longitude ?? null,
          data.incident_date ?? null,
          data.status ?? null,
          imagesData,
          data.assigned_catcher_id ?? null,
          data.incident_type ?? data.reportType ?? null,
          data.pet_color ?? data.petColor ?? null,
          data.pet_breed ?? data.petBreed ?? null,
          data.animal_type ?? data.animalType ?? null,
          data.pet_gender ?? data.petGender ?? null,
          data.pet_size ?? data.petSize ?? null
        ]
      );

      return result[0][0].affected_rows > 0;
    } catch (error) {
      logger.error('Failed to update incident', error);
      throw error;
    }
  }

  /**
   * Delete incident using stored procedure
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('CALL sp_incidents_delete(?)', [id]);
      return result[0][0].affected_rows > 0;
    } catch (error) {
      logger.error('Failed to delete incident', error);
      throw error;
    }
  }

  /**
   * Get incident count by status using stored procedure
   */
  static async getCountByStatus() {
    try {
      const [rows] = await pool.execute('CALL sp_incidents_count_by_status()');
      return rows[0];
    } catch (error) {
      logger.error('Failed to get count by status', error);
      throw error;
    }
  }

  /**
   * Search incidents by keyword
   */
  static async search(keyword, limit = 50) {
    try {
      const [rows] = await pool.execute(
        'CALL sp_incidents_search(?, ?)',
        [keyword, limit]
      );
      
      const incidents = rows[0];
      return incidents.map(row => ({
        ...row,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
      }));
    } catch (error) {
      logger.error('Failed to search incidents', error);
      throw error;
    }
  }

  /**
   * Get recent incidents (last N days)
   */
  static async getRecent(days = 7) {
    try {
      const [rows] = await pool.execute('CALL sp_incidents_get_recent(?)', [days]);
      
      const incidents = rows[0];
      return incidents.map(row => ({
        ...row,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
      }));
    } catch (error) {
      logger.error('Error in Incident.getRecent', error);
      throw error;
    }
  }
}

export default Incident;
