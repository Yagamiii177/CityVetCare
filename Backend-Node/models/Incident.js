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
          ir.report_id as id,
          ir.report_type,
          ir.description,
          ir.incident_date,
          ir.status,
          ir.reported_at as created_at,
          r.full_name as reporter_name,
          r.contact_number as reporter_contact,
          l.address_text as location,
          l.latitude,
          l.longitude,
          p.animal_type,
          p.pet_color,
          p.pet_breed,
          p.pet_gender,
          p.pet_size,
          GROUP_CONCAT(DISTINCT dc.full_name SEPARATOR ', ') as assigned_team
        FROM incident_report ir
        JOIN reporter r ON ir.reporter_id = r.reporter_id
        JOIN incident_location l ON ir.location_id = l.location_id
        LEFT JOIN incident_pet p ON ir.report_id = p.report_id
        LEFT JOIN patrol_schedule ps ON ir.report_id = ps.report_id AND ps.status IN ('Assigned', 'On Patrol')
        LEFT JOIN dog_catcher dc ON FIND_IN_SET(dc.catcher_id, ps.assigned_catcher_id) > 0
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.status) {
        query += ' AND ir.status = ?';
        params.push(filters.status);
      }
      
      if (filters.incident_type || filters.report_type) {
        query += ' AND ir.report_type = ?';
        params.push(filters.incident_type || filters.report_type);
      }
      
      if (filters.search) {
        query += ` AND (
          ir.description LIKE ? OR 
          p.animal_type LIKE ? OR 
          r.contact_number LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' GROUP BY ir.report_id';
      query += ' ORDER BY ir.reported_at DESC';
      
      if (filters.limit) {
        query += ' LIMIT ? OFFSET ?';
        params.push(filters.limit, filters.offset || 0);
      }
      
      const [rows] = await pool.execute(query, params);
      
      // Get images for each report
      for (let row of rows) {
        const [images] = await pool.execute(
          'SELECT image_path FROM report_image WHERE report_id = ?',
          [row.id]
        );
        row.images = images.map(img => img.image_path);
      }
      
      return rows;
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
          ir.report_id as id,
          ir.report_type,
          ir.description,
          ir.incident_date,
          ir.status,
          ir.reported_at as created_at,
          r.full_name as reporter_name,
          r.contact_number as reporter_contact,
          l.address_text as location,
          l.latitude,
          l.longitude,
          p.animal_type,
          p.pet_color,
          p.pet_breed,
          p.pet_gender,
          p.pet_size,
          GROUP_CONCAT(DISTINCT dc.full_name SEPARATOR ', ') as assigned_team
        FROM incident_report ir
        JOIN reporter r ON ir.reporter_id = r.reporter_id
        JOIN incident_location l ON ir.location_id = l.location_id
        LEFT JOIN incident_pet p ON ir.report_id = p.report_id
        LEFT JOIN patrol_schedule ps ON ir.report_id = ps.report_id AND ps.status IN ('Assigned', 'On Patrol')
        LEFT JOIN dog_catcher dc ON FIND_IN_SET(dc.catcher_id, ps.assigned_catcher_id) > 0
        WHERE ir.report_id = ?
        GROUP BY ir.report_id
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const incident = rows[0];
      
      // Get images
      const [images] = await pool.execute(
        'SELECT image_path FROM report_image WHERE report_id = ?',
        [id]
      );
      incident.images = images.map(img => img.image_path);
      
      return incident;
    } catch (error) {
      logger.error('Failed to get incident by ID', error);
      throw error;
    }
  }

  /**
   * Create new incident with normalized structure
   */
  static async create(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      logger.debug('Creating incident with data:', data);
      
      // 1. Create or get reporter
      let reporterId;
      if (data.reporter_contact) {
        // Check if reporter exists
        const [existingReporter] = await connection.execute(
          'SELECT reporter_id FROM reporter WHERE contact_number = ?',
          [data.reporter_contact]
        );
        
        if (existingReporter.length > 0) {
          reporterId = existingReporter[0].reporter_id;
        } else {
          // Create new reporter
          const [reporterResult] = await connection.execute(
            'INSERT INTO reporter (full_name, contact_number) VALUES (?, ?)',
            [data.reporter_name || 'Mobile User', data.reporter_contact]
          );
          reporterId = reporterResult.insertId;
        }
      } else {
        throw new Error('Reporter contact number is required');
      }
      
      // 2. Create location
      const [locationResult] = await connection.execute(
        'INSERT INTO incident_location (address_text, latitude, longitude) VALUES (?, ?, ?)',
        [
          data.location || `${data.latitude},${data.longitude}`,
          data.latitude || 0,
          data.longitude || 0
        ]
      );
      const locationId = locationResult.insertId;
      
      // 3. Create incident report
      const reportType = data.incident_type === 'incident' ? 'bite' : data.incident_type || 'stray';
      const incidentDate = data.incident_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const [reportResult] = await connection.execute(
        `INSERT INTO incident_report (
          reporter_id, location_id, report_type, description, incident_date, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          reporterId,
          locationId,
          reportType,
          data.description || null,
          incidentDate,
          data.status || 'Pending'
        ]
      );
      const reportId = reportResult.insertId;
      
      // 4. Create pet record if animal data provided
      if (data.animal_type) {
        await connection.execute(
          `INSERT INTO incident_pet (
            report_id, animal_type, pet_color, pet_breed, pet_gender, pet_size
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            data.animal_type === 'dog' ? 'Dog' : data.animal_type === 'cat' ? 'Cat' : 'Other',
            data.pet_color || null,
            data.pet_breed || null,
            data.pet_gender ? data.pet_gender.charAt(0).toUpperCase() + data.pet_gender.slice(1) : 'Unknown',
            data.pet_size ? data.pet_size.charAt(0).toUpperCase() + data.pet_size.slice(1) : 'Medium'
          ]
        );
      }
      
      // 5. Store images if provided
      let imageArray = [];
      if (data.images) {
        if (Array.isArray(data.images)) {
          imageArray = data.images;
        } else if (typeof data.images === 'string') {
          try {
            imageArray = JSON.parse(data.images);
          } catch (e) {
            logger.warn('Failed to parse images string, treating as single image');
            imageArray = [data.images];
          }
        }
      }
      
      if (imageArray.length > 0) {
        for (const imagePath of imageArray) {
          await connection.execute(
            'INSERT INTO report_image (report_id, image_path) VALUES (?, ?)',
            [reportId, imagePath]
          );
        }
      }
      
      await connection.commit();
      logger.info(`Incident created successfully with ID: ${reportId}`);
      
      return reportId;
    } catch (error) {
      await connection.rollback();
      logger.error('Failed to create incident', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update incident
   */
  static async update(id, data) {
    try {
      const fields = [];
      const params = [];
      
      if (data.description !== undefined) {
        fields.push('description = ?');
        params.push(data.description);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        params.push(data.status);
      }
      if (data.report_type !== undefined) {
        fields.push('report_type = ?');
        params.push(data.report_type);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      params.push(id);
      const query = `UPDATE incident_report SET ${fields.join(', ')} WHERE report_id = ?`;
      
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
      const [result] = await pool.execute('DELETE FROM incident_report WHERE report_id = ?', [id]);
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
          COUNT(*) as total,
          COUNT(CASE WHEN \`status\` = 'Pending' THEN 1 END) as pending,
          COUNT(CASE WHEN \`status\` = 'Verified' THEN 1 END) as verified,
          COUNT(CASE WHEN \`status\` = 'In Progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN \`status\` = 'Resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN \`status\` = 'Rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN \`status\` = 'Scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN \`status\` = 'Assigned' THEN 1 END) as assigned,
          COUNT(CASE WHEN report_type = 'bite' THEN 1 END) as bite_incidents,
          COUNT(CASE WHEN report_type = 'stray' THEN 1 END) as stray_incidents,
          COUNT(CASE WHEN report_type = 'lost' THEN 1 END) as lost_incidents,
          COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as \`high_priority\`
        FROM incident_report
      `;
      
      const [rows] = await pool.execute(query);
      
      const result = rows[0];
      
      return {
        total: parseInt(result.total) || 0,
        pending: parseInt(result.pending) || 0,
        verified: parseInt(result.verified) || 0,
        in_progress: parseInt(result.in_progress) || 0,
        resolved: parseInt(result.resolved) || 0,
        rejected: parseInt(result.rejected) || 0,
        scheduled: parseInt(result.scheduled) || 0,
        assigned: parseInt(result.assigned) || 0,
        bite_incidents: parseInt(result.bite_incidents) || 0,
        stray_incidents: parseInt(result.stray_incidents) || 0,
        lost_incidents: parseInt(result.lost_incidents) || 0,
        urgent: parseInt(result.urgent) || 0,
        high_priority: parseInt(result.high_priority) || 0
      };
    } catch (error) {
      logger.error('Failed to get counts by status', error);
      throw error;
    }
  }
}

export default Incident;
