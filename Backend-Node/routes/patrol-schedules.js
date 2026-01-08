import express from 'express';
import PatrolSchedule from '../models/PatrolSchedule.js';
import Incident from '../models/Incident.js';
import Logger from '../utils/logger.js';
import { notifyIncidentStatusChange } from '../services/notificationService.js';

const router = express.Router();
const logger = new Logger('PATROL-SCHEDULES');

/**
 * GET /api/patrol-schedules
 * Get all patrol schedules
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      incident_id: req.query.incident_id
    };

    const schedules = await PatrolSchedule.getAll(filters);
    
    res.json({
      success: true,
      records: schedules,
      total: schedules.length,
      message: schedules.length === 0 ? 'No patrol schedules found' : undefined
    });
  } catch (error) {
    logger.error('Error fetching patrol schedules', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol schedules',
      details: error.message 
    });
  }
});

/**
 * POST /api/patrol-schedules/check-conflict
 * Check for schedule conflicts before creating
 */
router.post('/check-conflict', async (req, res) => {
  try {
    const { staff_ids, schedule_date, schedule_time, exclude_schedule_id } = req.body;

    if (!staff_ids || !schedule_date) {
      return res.status(400).json({ 
        error: true,
        message: 'Staff IDs and schedule date are required' 
      });
    }

    const conflicts = await PatrolSchedule.checkConflicts(
      staff_ids, 
      schedule_date, 
      schedule_time,
      exclude_schedule_id
    );
    
    res.json({
      success: true,
      has_conflict: conflicts.length > 0,
      conflicts: conflicts,
      message: conflicts.length > 0 
        ? `Found ${conflicts.length} conflicting schedule(s)` 
        : 'No conflicts found'
    });
  } catch (error) {
    logger.error('Error checking schedule conflicts', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to check schedule conflicts',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-schedules/incident/:incidentId
 * Get schedules by incident ID
 */
router.get('/incident/:incidentId', async (req, res) => {
  try {
    const schedules = await PatrolSchedule.getByIncidentId(req.params.incidentId);
    
    res.json({
      success: true,
      records: schedules,
      total: schedules.length
    });
  } catch (error) {
    logger.error('Error fetching patrol schedules by incident', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol schedules',
      details: error.message 
    });
  }
});

/**
 * GET /api/patrol-schedules/:id
 * Get single patrol schedule by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const schedule = await PatrolSchedule.getById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found' 
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error fetching patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch patrol schedule',
      details: error.message 
    });
  }
});

/**
 * POST /api/patrol-schedules
 * Create new patrol schedule
 */
router.post('/', async (req, res) => {
  try {
    const { incident_id, schedule_date } = req.body;

    if (!incident_id || !schedule_date) {
      return res.status(400).json({ 
        error: true,
        message: 'Incident ID and schedule date are required' 
      });
    }

    const schedule = await PatrolSchedule.create(req.body);
    
    // Get incident details to check if it has an owner_id
    try {
      const incident = await Incident.getById(incident_id);
      
      // Update incident status to "Scheduled" if not already
      if (incident && incident.owner_id) {
        if (incident.status !== 'Scheduled' && incident.status !== 'In Progress' && incident.status !== 'Resolved') {
          await Incident.update(incident_id, { status: 'Scheduled' });
          
          // Send notification to pet owner
          await notifyIncidentStatusChange({
            ownerId: incident.owner_id,
            incidentId: incident_id,
            status: 'Scheduled'
          });
          
          logger.info(`✅ Incident ${incident_id} status updated to Scheduled and notification sent`);
        }
      }
    } catch (notifError) {
      // Don't fail the request if notification fails
      logger.error('⚠️ Failed to update incident status or send notification', notifError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Patrol schedule created successfully',
      id: schedule.id,
      data: schedule
    });
  } catch (error) {
    logger.error('Error creating patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to create patrol schedule',
      details: error.message 
    });
  }
});

/**
 * PUT /api/patrol-schedules/:id
 * Update patrol schedule
 */
router.put('/:id', async (req, res) => {
  try {
    // Get current schedule data before update to check for status changes
    const currentSchedule = await PatrolSchedule.getById(req.params.id);
    
    if (!currentSchedule) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found' 
      });
    }
    
    const updated = await PatrolSchedule.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found or no changes made' 
      });
    }

    // If status changed to "In Progress", update incident and notify owner
    if (req.body.status && 
        req.body.status !== currentSchedule.status && 
        currentSchedule.report_id) {
      try {
        const incident = await Incident.getById(currentSchedule.report_id);
        
        if (incident && incident.owner_id) {
          // Update incident status to match patrol status
          if (req.body.status === 'In Progress' && incident.status !== 'In Progress') {
            await Incident.update(currentSchedule.report_id, { status: 'In Progress' });
            
            // Send notification
            await notifyIncidentStatusChange({
              ownerId: incident.owner_id,
              incidentId: currentSchedule.report_id,
              status: 'In Progress'
            });
            
            logger.info(`✅ Incident ${currentSchedule.report_id} status updated to In Progress and notification sent`);
          }
        }
      } catch (notifError) {
        logger.error('⚠️ Failed to update incident or send notification', notifError);
      }
    }

    res.json({ 
      success: true,
      message: 'Patrol schedule updated successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error updating patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to update patrol schedule',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/patrol-schedules/:id/staff/:staffId
 * Remove a staff member from a patrol schedule
 */
router.delete('/:id/staff/:staffId', async (req, res) => {
  try {
    const { id, staffId } = req.params;
    
    const removed = await PatrolSchedule.removeStaff(id, staffId);
    
    if (!removed) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found or staff member not in schedule' 
      });
    }

    res.json({ 
      success: true,
      message: 'Staff member removed from patrol schedule successfully',
      schedule_id: id,
      removed_staff_id: staffId
    });
  } catch (error) {
    logger.error('Error removing staff from patrol schedule', error);
    
    // Check if it's a validation error (last staff member)
    if (error.message.includes('Cannot remove the last staff member')) {
      return res.status(400).json({ 
        error: true,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      error: true,
      message: 'Failed to remove staff member',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/patrol-schedules/:id
 * Delete patrol schedule
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PatrolSchedule.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: true,
        message: 'Patrol schedule not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Patrol schedule deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    logger.error('Error deleting patrol schedule', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to delete patrol schedule',
      details: error.message 
    });
  }
});

export default router;
