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
          ir.updated_at,
          ir.owner_id,
          CASE 
            WHEN ir.owner_id IS NOT NULL THEN po.full_name
            ELSE r.full_name
          END as reporter_name,
          CASE
            WHEN ir.owner_id IS NOT NULL THEN po.contact_number
            ELSE r.contact_number
          END as reporter_contact,
          CASE
            WHEN ir.owner_id IS NOT NULL THEN 'Pet Owner'
            ELSE 'Anonymous (Emergency)'
          END as account_type,
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
        LEFT JOIN pet_owner po ON ir.owner_id = po.owner_id
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
      
      // Get images for each report and generate title from report_type
      for (let row of rows) {
        const [images] = await pool.execute(
          'SELECT image_path FROM report_image WHERE report_id = ?',
          [row.id]
        );
        row.images = images.map(img => img.image_path);
        
        // Generate title based on report_type for frontend compatibility
        if (row.report_type) {
          if (row.report_type === 'bite' || row.report_type === 'incident') {
            row.title = 'Bite Incident';
          } else if (row.report_type === 'stray') {
            row.title = 'Stray Animal';
          } else if (row.report_type === 'lost') {
            row.title = 'Lost Pet';
          } else {
            row.title = row.report_type.charAt(0).toUpperCase() + row.report_type.slice(1);
          }
        } else {
          row.title = 'Unknown Incident';
        }
        
        // Also add incident_type field for mobile compatibility
        row.incident_type = row.report_type;
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
          ir.updated_at,
          ir.owner_id,
          ir.priority,
          CASE 
            WHEN ir.owner_id IS NOT NULL THEN po.full_name
            ELSE r.full_name
          END as reporter_name,
          CASE
            WHEN ir.owner_id IS NOT NULL THEN po.contact_number
            ELSE r.contact_number
          END as reporter_contact,
          CASE
            WHEN ir.owner_id IS NOT NULL THEN po.email
            ELSE NULL
          END as reporter_email,
          CASE
            WHEN ir.owner_id IS NOT NULL THEN 'Pet Owner'
            ELSE 'Anonymous (Emergency)'
          END as account_type,
          l.address_text as location,
          l.latitude,
          l.longitude,
          p.animal_type,
          p.pet_color,
          p.pet_breed,
          p.pet_gender,
          p.pet_size,
          ps.schedule_id as patrol_schedule_id,
          ps.schedule_date as patrol_date,
          ps.schedule_time as patrol_time,
          ps.status as patrol_status,
          ps.notes as patrol_notes,
          ps.created_at as patrol_scheduled_at,
          ps.updated_at as patrol_updated_at,
          GROUP_CONCAT(DISTINCT CONCAT(dc.catcher_id, ':', dc.full_name, ':', COALESCE(dc.contact_number, '')) SEPARATOR '||') as assigned_catchers_data
        FROM incident_report ir
        JOIN reporter r ON ir.reporter_id = r.reporter_id
        LEFT JOIN pet_owner po ON ir.owner_id = po.owner_id
        JOIN incident_location l ON ir.location_id = l.location_id
        LEFT JOIN incident_pet p ON ir.report_id = p.report_id
        LEFT JOIN patrol_schedule ps ON ir.report_id = ps.report_id
        LEFT JOIN dog_catcher dc ON FIND_IN_SET(dc.catcher_id, ps.assigned_catcher_id) > 0
        WHERE ir.report_id = ?
        GROUP BY ir.report_id
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const incident = rows[0];
      
      // Parse assigned catchers data
      if (incident.assigned_catchers_data) {
        const catchersArray = incident.assigned_catchers_data.split('||');
        incident.assigned_catchers = catchersArray.map(catcherData => {
          const [catcher_id, full_name, contact_number] = catcherData.split(':');
          return {
            catcher_id: parseInt(catcher_id),
            full_name,
            contact_number: contact_number || null
          };
        });
      } else {
        incident.assigned_catchers = [];
      }
      delete incident.assigned_catchers_data;
      
      // Get images
      const [images] = await pool.execute(
        'SELECT image_path FROM report_image WHERE report_id = ?',
        [id]
      );
      incident.images = images.map(img => img.image_path);
      
      // Generate title based on report_type for frontend compatibility
      if (incident.report_type) {
        if (incident.report_type === 'bite' || incident.report_type === 'incident') {
          incident.title = 'Bite Incident';
        } else if (incident.report_type === 'stray') {
          incident.title = 'Stray Animal';
        } else if (incident.report_type === 'lost') {
          incident.title = 'Lost Pet';
        } else {
          incident.title = incident.report_type.charAt(0).toUpperCase() + incident.report_type.slice(1);
        }
      } else {
        incident.title = 'Unknown Incident';
      }
      
      // Also add incident_type field for mobile compatibility
      incident.incident_type = incident.report_type;
      
      // Build timeline based on actual data
      incident.timeline = [
        {
          status: 'Reported',
          timestamp: incident.created_at,
          description: `Report submitted by ${incident.reporter_name}`,
          completed: true
        }
      ];
      
      if (incident.status !== 'Pending' && incident.status !== 'Rejected' && incident.status !== 'Cancelled') {
        incident.timeline.push({
          status: 'Verified',
          timestamp: incident.status === 'Verified' ? incident.updated_at : null,
          description: 'Report verified by admin',
          completed: incident.status !== 'Pending'
        });
      }
      
      if (incident.patrol_scheduled_at) {
        incident.timeline.push({
          status: 'Scheduled',
          timestamp: incident.patrol_scheduled_at,
          description: `Patrol scheduled for ${incident.patrol_date} ${incident.patrol_time || ''}`,
          completed: true
        });
      }
      
      if (incident.patrol_status === 'On Patrol' || incident.patrol_status === 'Completed') {
        incident.timeline.push({
          status: 'In Progress',
          timestamp: incident.patrol_status === 'On Patrol' ? incident.patrol_updated_at : null,
          description: 'Patrol team is on site',
          completed: true
        });
      }
      
      if (incident.status === 'Resolved' || incident.patrol_status === 'Completed') {
        incident.timeline.push({
          status: 'Resolved',
          timestamp: incident.status === 'Resolved' ? incident.updated_at : null,
          description: 'Incident resolved successfully',
          completed: incident.status === 'Resolved'
        });
      }
      
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
      
      // Support owner_id for authenticated mobile reports (only if it's a valid numeric value)
      const parsedOwnerId = data.owner_id != null && String(data.owner_id).trim() !== ''
        ? Number(data.owner_id)
        : null;
      const hasValidOwnerId = Number.isFinite(parsedOwnerId);

      const queryFields = hasValidOwnerId
        ? 'reporter_id, location_id, owner_id, report_type, description, incident_date, status'
        : 'reporter_id, location_id, report_type, description, incident_date, status';
      
      const queryPlaceholders = hasValidOwnerId ? '?, ?, ?, ?, ?, ?, ?' : '?, ?, ?, ?, ?, ?';
      const queryParams = hasValidOwnerId
        ? [reporterId, locationId, parsedOwnerId, reportType, data.description || null, incidentDate, data.status || 'Pending']
        : [reporterId, locationId, reportType, data.description || null, incidentDate, data.status || 'Pending'];
      
      const [reportResult] = await connection.execute(
        `INSERT INTO incident_report (${queryFields}) VALUES (${queryPlaceholders})`,
        queryParams
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
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update incident_report fields
      const incidentFields = [];
      const incidentParams = [];
      
      if (data.description !== undefined) {
        incidentFields.push('description = ?');
        incidentParams.push(data.description);
      }
      if (data.status !== undefined) {
        incidentFields.push('status = ?');
        incidentParams.push(data.status);
      }
      if (data.report_type !== undefined) {
        incidentFields.push('report_type = ?');
        incidentParams.push(data.report_type);
      }
      if (data.incident_type !== undefined) {
        incidentFields.push('report_type = ?');
        const reportType = data.incident_type === 'incident' ? 'bite' : data.incident_type;
        incidentParams.push(reportType);
      }
      if (data.incident_date !== undefined) {
        incidentFields.push('incident_date = ?');
        incidentParams.push(data.incident_date);
      }
      
      // Update incident_report if there are fields to update
      if (incidentFields.length > 0) {
        incidentParams.push(id);
        const query = `UPDATE incident_report SET ${incidentFields.join(', ')} WHERE report_id = ?`;
        await connection.execute(query, incidentParams);
      }
      
      // Update location if provided
      if (data.location !== undefined || data.latitude !== undefined || data.longitude !== undefined) {
        // Get location_id for this incident
        const [incident] = await connection.execute(
          'SELECT location_id FROM incident_report WHERE report_id = ?',
          [id]
        );
        
        if (incident.length > 0) {
          const locationId = incident[0].location_id;
          const locationFields = [];
          const locationParams = [];
          
          if (data.location !== undefined) {
            locationFields.push('address_text = ?');
            locationParams.push(data.location);
          }
          if (data.latitude !== undefined) {
            locationFields.push('latitude = ?');
            locationParams.push(data.latitude);
          }
          if (data.longitude !== undefined) {
            locationFields.push('longitude = ?');
            locationParams.push(data.longitude);
          }
          
          if (locationFields.length > 0) {
            locationParams.push(locationId);
            const locationQuery = `UPDATE incident_location SET ${locationFields.join(', ')} WHERE location_id = ?`;
            await connection.execute(locationQuery, locationParams);
          }
        }
      }
      
      // Update pet/animal information if provided
      if (data.animal_type !== undefined || data.pet_color !== undefined || 
          data.pet_breed !== undefined || data.pet_gender !== undefined || data.pet_size !== undefined) {
        
        // Check if pet record exists
        const [existingPet] = await connection.execute(
          'SELECT report_id FROM incident_pet WHERE report_id = ?',
          [id]
        );
        
        if (existingPet.length > 0) {
          // Update existing pet record
          const petFields = [];
          const petParams = [];
          
          if (data.animal_type !== undefined) {
            petFields.push('animal_type = ?');
            petParams.push(data.animal_type);
          }
          if (data.pet_color !== undefined) {
            petFields.push('pet_color = ?');
            petParams.push(data.pet_color);
          }
          if (data.pet_breed !== undefined) {
            petFields.push('pet_breed = ?');
            petParams.push(data.pet_breed);
          }
          if (data.pet_gender !== undefined) {
            petFields.push('pet_gender = ?');
            petParams.push(data.pet_gender);
          }
          if (data.pet_size !== undefined) {
            petFields.push('pet_size = ?');
            petParams.push(data.pet_size);
          }
          
          if (petFields.length > 0) {
            petParams.push(id);
            const petQuery = `UPDATE incident_pet SET ${petFields.join(', ')} WHERE report_id = ?`;
            await connection.execute(petQuery, petParams);
          }
        } else if (data.animal_type) {
          // Create new pet record if it doesn't exist and animal_type is provided
          await connection.execute(
            `INSERT INTO incident_pet (report_id, animal_type, pet_color, pet_breed, pet_gender, pet_size) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id,
              data.animal_type,
              data.pet_color || null,
              data.pet_breed || null,
              data.pet_gender || null,
              data.pet_size || null
            ]
          );
        }
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error('Failed to update incident', error);
      throw error;
    } finally {
      connection.release();
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
   * Get all reports submitted by a specific pet owner
   * @param {number} ownerId - The pet owner ID
   * @param {object} filters - Optional filters (status)
   */
  static async getByOwnerId(ownerId, filters = {}) {
    try {
      let query = `
        SELECT 
          ir.report_id as id,
          ir.report_type as incident_type,
          ir.description,
          ir.incident_date,
          ir.status,
          ir.reported_at as created_at,
          ir.updated_at,
          ir.priority,
          l.address_text as location_address,
          l.address_text as location,
          l.latitude,
          l.longitude,
          p.animal_type,
          p.pet_color,
          p.pet_breed,
          p.pet_gender,
          p.pet_size,
          ps.schedule_id as patrol_schedule_id,
          ps.schedule_date as patrol_date,
          ps.schedule_time as patrol_time,
          ps.status as patrol_status,
          ps.notes as patrol_notes,
          ps.created_at as patrol_scheduled_at,
          ps.updated_at as patrol_updated_at,
          GROUP_CONCAT(DISTINCT CONCAT(dc.catcher_id, ':', dc.full_name, ':', COALESCE(dc.contact_number, '')) SEPARATOR '||') as assigned_catchers_data,
          ia.severity_level,
          ia.injuries_description as resolution_notes
        FROM incident_report ir
        JOIN incident_location l ON ir.location_id = l.location_id
        LEFT JOIN incident_pet p ON ir.report_id = p.report_id
        LEFT JOIN patrol_schedule ps ON ir.report_id = ps.report_id
        LEFT JOIN dog_catcher dc ON FIND_IN_SET(dc.catcher_id, ps.assigned_catcher_id) > 0
        LEFT JOIN incident_assessment ia ON ir.report_id = ia.report_id
        WHERE ir.owner_id = ?
      `;
      
      const params = [ownerId];
      
      // Add status filter if provided
      if (filters.status && filters.status !== 'All') {
        query += ' AND ir.status = ?';
        params.push(filters.status);
      }
      
      query += ' GROUP BY ir.report_id';
      query += ' ORDER BY ir.reported_at DESC';
      
      const [rows] = await pool.execute(query, params);
      
      // Process each report
      for (let row of rows) {
        // Parse assigned catchers data
        if (row.assigned_catchers_data) {
          const catchersArray = row.assigned_catchers_data.split('||');
          row.assigned_catchers = catchersArray.map(catcherData => {
            const [catcher_id, full_name, contact_number] = catcherData.split(':');
            return {
              catcher_id: parseInt(catcher_id),
              full_name,
              contact_number: contact_number || null
            };
          });
          row.assigned_catchers_list = row.assigned_catchers.map(c => c.full_name).join(', ');
        } else {
          row.assigned_catchers = [];
          row.assigned_catchers_list = null;
        }
        delete row.assigned_catchers_data;
        
        // Get images for each report
        const [images] = await pool.execute(
          'SELECT image_path FROM report_image WHERE report_id = ?',
          [row.id]
        );
        row.images = images.map(img => img.image_path);
        
        // Generate title based on incident_type (report_type) for frontend compatibility
        if (row.incident_type) {
          if (row.incident_type === 'bite' || row.incident_type === 'incident') {
            row.title = 'Bite Incident';
          } else if (row.incident_type === 'stray') {
            row.title = 'Stray Animal';
          } else if (row.incident_type === 'lost') {
            row.title = 'Lost Pet';
          } else {
            row.title = row.incident_type.charAt(0).toUpperCase() + row.incident_type.slice(1);
          }
        } else {
          row.title = 'Unknown Incident';
        }
        
        // Build timeline
        row.timeline = [
          {
            status: 'Reported',
            timestamp: row.created_at,
            description: 'Report submitted',
            completed: true
          }
        ];
        
        if (row.status !== 'Pending' && row.status !== 'Rejected' && row.status !== 'Cancelled') {
          row.timeline.push({
            status: 'Verified',
            timestamp: row.status === 'Verified' ? row.updated_at : null,
            description: 'Report verified',
            completed: row.status !== 'Pending'
          });
        }
        
        if (row.patrol_scheduled_at) {
          row.timeline.push({
            status: 'Scheduled',
            timestamp: row.patrol_scheduled_at,
            description: `Patrol scheduled for ${row.patrol_date}`,
            completed: true
          });
        }
        
        if (row.patrol_status === 'On Patrol' || row.patrol_status === 'Completed') {
          row.timeline.push({
            status: 'In Progress',
            timestamp: row.patrol_status === 'On Patrol' ? row.patrol_updated_at : null,
            description: 'Patrol in progress',
            completed: true
          });
        }
        
        if (row.status === 'Resolved' || row.patrol_status === 'Completed') {
          row.timeline.push({
            status: 'Resolved',
            timestamp: row.status === 'Resolved' ? row.updated_at : null,
            description: 'Incident resolved',
            completed: row.status === 'Resolved'
          });
        }
        
        // Format dates
        row.is_emergency = false; // Authenticated reports are not emergency
        row.account_type = 'Pet Owner';
      }
      
      logger.info(`Found ${rows.length} reports for owner ${ownerId}`);
      return rows;
    } catch (error) {
      logger.error(`Failed to get reports for owner ${ownerId}`, error);
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
