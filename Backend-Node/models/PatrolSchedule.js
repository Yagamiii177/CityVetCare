import pool from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PATROL-SCHEDULE-MODEL');

class PatrolSchedule {
  /**
   * Get all patrol schedules with optional filters
   * Properly handles multiple staff IDs per patrol (comma-separated)
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
          il.address_text as incident_location
        FROM patrol_schedule ps
        LEFT JOIN incident_report ir ON ps.report_id = ir.report_id
        LEFT JOIN incident_location il ON ir.location_id = il.location_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Map frontend status to database ENUM values
      if (filters.status) {
        const statusMap = {
          'scheduled': 'Assigned',
          'in_progress': 'On Patrol',
          'completed': 'Completed',
          'cancelled': 'Cancelled'
        };
        const dbStatus = statusMap[filters.status] || filters.status;
        query += ' AND ps.status = ?';
        params.push(dbStatus);
      }
      if (filters.incident_id) {
        query += ' AND ps.report_id = ?';
        params.push(filters.incident_id);
      }
      
      query += ' ORDER BY ps.schedule_date DESC, ps.schedule_time DESC';
      
      const [rows] = await pool.execute(query, params);
      
      // For each patrol schedule, fetch all assigned staff names
      const enrichedRows = await Promise.all(rows.map(async (row) => {
        // Parse staff IDs (comma-separated: "1,2,3")
        const staffIds = row.assigned_catcher_id ? row.assigned_catcher_id.toString().split(',').filter(id => id.trim()) : [];
        
        if (staffIds.length > 0) {
          // Fetch all staff details (including contact_number) for this patrol group
          const placeholders = staffIds.map(() => '?').join(',');
          const [staffRows] = await pool.execute(
            `SELECT catcher_id, full_name, contact_number FROM dog_catcher WHERE catcher_id IN (${placeholders})`,
            staffIds
          );
          
          const staffNames = staffRows.map(s => s.full_name).join(', ');
          
          return {
            ...row,
            assigned_staff_ids: row.assigned_catcher_id, // Keep original comma-separated IDs
            assigned_staff_names: staffNames,
            staff_details: staffRows, // Add detailed staff information
            staff_count: staffIds.length,
            status: this.mapStatusToFrontend(row.status)
          };
        }
        
        return {
          ...row,
          assigned_staff_ids: row.assigned_catcher_id,
          assigned_staff_names: 'Unassigned',
          staff_count: 0,
          status: this.mapStatusToFrontend(row.status)
        };
      }));
      
      return enrichedRows;
    } catch (error) {
      logger.error('Error in PatrolSchedule.getAll', error);
      throw error;
    }
  }

  /**
   * Map database status to frontend format
   */
  static mapStatusToFrontend(dbStatus) {
    const statusMap = {
      'Assigned': 'scheduled',
      'On Patrol': 'in_progress',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };
    return statusMap[dbStatus] || dbStatus.toLowerCase();
  }

  /**
   * Map frontend status to database format
   */
  static mapStatusToDatabase(frontendStatus) {
    const statusMap = {
      'scheduled': 'Assigned',
      'in_progress': 'On Patrol',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[frontendStatus] || frontendStatus;
  }

  /**
   * Get single patrol schedule by ID
   * Properly handles multiple staff IDs per patrol (comma-separated)
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
          il.address_text as incident_location
        FROM patrol_schedule ps
        LEFT JOIN incident_report ir ON ps.report_id = ir.report_id
        LEFT JOIN incident_location il ON ir.location_id = il.location_id
        WHERE ps.schedule_id = ?`,
        [id]
      );
      
      if (!rows[0]) {
        return null;
      }
      
      const row = rows[0];
      
      // Parse staff IDs (comma-separated: "1,2,3")
      const staffIds = row.assigned_catcher_id ? row.assigned_catcher_id.toString().split(',').filter(id => id.trim()) : [];
      
      if (staffIds.length > 0) {
        // Fetch all staff details (including contact_number) for this patrol group
        const placeholders = staffIds.map(() => '?').join(',');
        const [staffRows] = await pool.execute(
          `SELECT catcher_id, full_name, contact_number FROM dog_catcher WHERE catcher_id IN (${placeholders})`,
          staffIds
        );
        
        const staffNames = staffRows.map(s => s.full_name).join(', ');
        
        return {
          ...row,
          assigned_staff_ids: row.assigned_catcher_id,
          assigned_staff_names: staffNames,
          staff_details: staffRows, // Add detailed staff information
          staff_count: staffIds.length,
          status: this.mapStatusToFrontend(row.status)
        };
      }
      
      return {
        ...row,
        assigned_staff_ids: row.assigned_catcher_id,
        assigned_staff_names: 'Unassigned',
        staff_count: 0,
        status: this.mapStatusToFrontend(row.status)
      };
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
   * Check for schedule conflicts
   * Validates that no staff member in the patrol group is already assigned to another patrol
   * Returns conflicting schedules if any exist
   */
  static async checkConflicts(staffIds, scheduleDate, scheduleTime, excludeScheduleId = null) {
    try {
      // Parse the schedule date and time
      const scheduleDateOnly = scheduleDate.split(' ')[0]; // Get date part only
      const timeToCheck = scheduleTime || scheduleDate.split(' ')[1] || '00:00:00';
      
      // Get staff IDs as array
      const staffArray = Array.isArray(staffIds) ? staffIds : staffIds.toString().split(',').map(id => id.trim());
      
      if (staffArray.length === 0) {
        return [];
      }
      
      // Build query to check for conflicts
      // CRITICAL: Must check if ANY staff member in the patrol group is already assigned
      let query = `
        SELECT 
          ps.schedule_id,
          ps.assigned_catcher_id,
          ps.schedule_date,
          ps.schedule_time,
          ps.status
        FROM patrol_schedule ps
        WHERE DATE(ps.schedule_date) = ?
          AND ps.status IN ('Assigned', 'On Patrol')
      `;
      
      const params = [scheduleDateOnly];
      
      if (excludeScheduleId) {
        query += ' AND ps.schedule_id != ?';
        params.push(excludeScheduleId);
      }
      
      const [existingSchedules] = await pool.execute(query, params);
      
      // Check each existing schedule to see if it conflicts with our patrol group
      const conflicts = [];
      
      for (const schedule of existingSchedules) {
        // Parse staff IDs from existing schedule (may be comma-separated)
        const existingStaffIds = schedule.assigned_catcher_id ? 
          schedule.assigned_catcher_id.toString().split(',').map(id => id.trim()) : [];
        
        // Check if there's any overlap between staff members
        const hasStaffOverlap = staffArray.some(staffId => existingStaffIds.includes(staffId.toString()));
        
        if (!hasStaffOverlap) {
          continue; // No staff conflict, skip time check
        }
        
        // Check time conflict (within 2 hours)
        const checkTime = new Date(`2000-01-01 ${timeToCheck}`);
        const existingTime = new Date(`2000-01-01 ${schedule.schedule_time || '00:00:00'}`);
        const timeDiff = Math.abs(checkTime - existingTime) / (1000 * 60 * 60); // Hours
        
        if (timeDiff < 2) {
          // Find which staff members conflict
          const conflictingStaffIds = staffArray.filter(staffId => existingStaffIds.includes(staffId.toString()));
          
          // Fetch staff names
          const placeholders = conflictingStaffIds.map(() => '?').join(',');
          const [staffRows] = await pool.execute(
            `SELECT catcher_id, full_name FROM dog_catcher WHERE catcher_id IN (${placeholders})`,
            conflictingStaffIds
          );
          
          staffRows.forEach(staff => {
            conflicts.push({
              schedule_id: schedule.schedule_id,
              assigned_catcher_id: staff.catcher_id,
              staff_name: staff.full_name,
              schedule_date: schedule.schedule_date,
              schedule_time: schedule.schedule_time
            });
          });
        }
      }
      
      return conflicts;
    } catch (error) {
      logger.error('Error in PatrolSchedule.checkConflicts', error);
      throw error;
    }
  }

  /**
   * Create new patrol schedule with conflict validation
   * CRITICAL: Creates ONE patrol schedule with MULTIPLE staff members as a team
   */
  static async create(data) {
    try {
      // Extract staff IDs (support multiple staff members)
      const staffIds = data.assigned_staff_ids || '';
      const staffArray = Array.isArray(staffIds) 
        ? staffIds 
        : staffIds.toString().split(',').map(id => id.trim()).filter(id => id);
      
      if (staffArray.length === 0) {
        throw new Error('At least one staff member must be assigned');
      }
      
      // Extract date and time
      const scheduleDate = data.schedule_date;
      const scheduleTime = data.schedule_time;
      
      // Check for conflicts (checks entire patrol group)
      const conflicts = await this.checkConflicts(staffArray, scheduleDate, scheduleTime);
      
      if (conflicts.length > 0) {
        const conflictDetails = conflicts.map(c => 
          `${c.staff_name} on ${new Date(c.schedule_date).toLocaleDateString()} at ${c.schedule_time}`
        ).join('; ');
        
        throw new Error(`Schedule conflict detected: ${conflictDetails}`);
      }
      
      // Map status to database format
      const dbStatus = this.mapStatusToDatabase(data.status || 'scheduled');
      
      // CRITICAL FIX: Create ONE patrol schedule record with ALL staff IDs
      // Store multiple staff as comma-separated string in assigned_catcher_id
      // This represents ONE patrol group, not individual patrols
      const [result] = await pool.execute(
        `INSERT INTO patrol_schedule 
         (report_id, assigned_catcher_id, schedule_date, schedule_time, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.incident_id,
          staffArray.join(','),  // Store all staff IDs together (e.g., "1,2,3")
          scheduleDate,
          scheduleTime || null,
          dbStatus,
          data.notes || null
        ]
      );
      
      // CRITICAL FIX: Update incident report status to "In Progress" when patrol is scheduled
      // This ensures ALL modules (Patrol Schedule, All Incident Reports, Dashboard, Monitoring Map)
      // see the same status from the single source of truth (incident_report.status)
      await pool.execute(
        `UPDATE incident_report SET status = 'In Progress' WHERE report_id = ?`,
        [data.incident_id]
      );
      
      logger.info(`✓ INCIDENT STATUS SYNC: Incident ${data.incident_id} status updated to 'In Progress' after patrol assignment`);
      
      // Return ONE patrol schedule with all staff information
      return {
        id: result.insertId,
        incident_id: data.incident_id,
        assigned_catcher_id: staffArray.join(','),  // Multiple IDs
        assigned_staff_ids: staffArray.join(','),
        assigned_staff_names: data.assigned_staff_names,
        schedule_date: scheduleDate,
        schedule_time: scheduleTime,
        status: data.status || 'scheduled',
        notes: data.notes,
        staff_count: staffArray.length
      };
    } catch (error) {
      logger.error('Error in PatrolSchedule.create', error);
      throw error;
    }
  }

  /**
   * Update patrol schedule
   * CRITICAL FIX: When patrol status changes to 'completed', update incident status to 'Resolved'
   */
  static async update(id, data) {
    try {
      // First, get the current schedule to retrieve incident_id
      const [currentSchedule] = await pool.execute(
        'SELECT report_id, status FROM patrol_schedule WHERE schedule_id = ?',
        [id]
      );
      
      if (currentSchedule.length === 0) {
        return false;
      }
      
      const incidentId = currentSchedule[0].report_id;
      const oldStatus = currentSchedule[0].status;
      
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
        const dbStatus = this.mapStatusToDatabase(data.status);
        fields.push('status = ?');
        params.push(dbStatus);
        
        // CRITICAL FIX: Update incident status when patrol is completed
        if (data.status === 'completed' || dbStatus === 'Completed') {
          await pool.execute(
            `UPDATE incident_report SET status = 'Resolved' WHERE report_id = ?`,
            [incidentId]
          );
          logger.info(`✓ INCIDENT STATUS SYNC: Incident ${incidentId} status updated to 'Resolved' after patrol completion`);
        }
        // Also handle in_progress status update
        else if (data.status === 'in_progress' || dbStatus === 'On Patrol') {
          await pool.execute(
            `UPDATE incident_report SET status = 'In Progress' WHERE report_id = ?`,
            [incidentId]
          );
          logger.info(`✓ INCIDENT STATUS SYNC: Incident ${incidentId} status updated to 'In Progress' when patrol started`);
        }
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

  /**
   * Remove a staff member from a patrol schedule
   * CRITICAL: At least one staff member must remain assigned
   */
  static async removeStaff(scheduleId, staffIdToRemove) {
    try {
      // Get current schedule
      const [scheduleRows] = await pool.execute(
        'SELECT assigned_catcher_id FROM patrol_schedule WHERE schedule_id = ?',
        [scheduleId]
      );
      
      if (scheduleRows.length === 0) {
        throw new Error('Patrol schedule not found');
      }
      
      const currentStaffIds = scheduleRows[0].assigned_catcher_id
        .toString()
        .split(',')
        .map(id => id.trim())
        .filter(id => id);
      
      // Check if trying to remove the last staff member
      if (currentStaffIds.length === 1) {
        throw new Error('Cannot remove the last staff member from the patrol schedule. At least one staff member must be assigned.');
      }
      
      // Remove the staff ID from the list
      const updatedStaffIds = currentStaffIds
        .filter(id => id !== staffIdToRemove.toString())
        .join(',');
      
      // Update the patrol schedule
      const [result] = await pool.execute(
        'UPDATE patrol_schedule SET assigned_catcher_id = ? WHERE schedule_id = ?',
        [updatedStaffIds, scheduleId]
      );
      
      logger.info(`✓ Staff ${staffIdToRemove} removed from patrol schedule ${scheduleId}. Remaining staff: ${updatedStaffIds}`);
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error in PatrolSchedule.removeStaff', error);
      throw error;
    }
  }
}

export default PatrolSchedule;
