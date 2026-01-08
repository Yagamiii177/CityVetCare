import express from 'express';
import Incident from '../models/Incident.js';
import Logger from '../utils/logger.js';
import { upload } from '../config/multer.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { notifyIncidentSubmitted, notifyIncidentStatusChange } from '../services/notificationService.js';

const router = express.Router();
const logger = new Logger('INCIDENTS');

/**
 * GET /api/incidents
 * Get all incidents with optional filters, search, and pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const filters = {
      status: req.query.status,
      incident_type: req.query.incident_type,
      search: req.query.search,
      limit: limit,
      offset: offset
    };

    logger.debug('Fetching incidents with filters', filters);

    const incidents = await Incident.getAll(filters);
    
    const allIncidents = await Incident.getAll({ 
      status: req.query.status,
      incident_type: req.query.incident_type,
      search: req.query.search
    });
    const total = allIncidents.length;
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      records: incidents,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: incidents.length === 0 ? 'No incidents found' : undefined
    });
  } catch (error) {
    logger.error('Failed to fetch incidents', error);
    res.status(500).json({ 
      success: false,
      error: true,
      message: 'Failed to fetch incidents',
      details: error.message 
    });
  }
});

/**
 * GET /api/incidents/my-reports
 * Get all incidents reported by the authenticated user
 * Requires authentication
 */
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    
    // Only pet owners can access my reports
    if (userType !== 'pet_owner') {
      return res.status(403).json({
        success: false,
        error: 'Only pet owners can access their reports'
      });
    }
    
    const filters = {
      status: req.query.status
    };
    
    logger.debug(`Fetching reports for authenticated user ${userId}`, filters);
    
    const incidents = await Incident.getByOwnerId(userId, filters);
    
    res.json({
      success: true,
      data: incidents,
      total: incidents.length,
      message: incidents.length === 0 ? 'No reports found' : undefined
    });
  } catch (error) {
    logger.error('Failed to fetch user reports', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your reports',
      details: error.message
    });
  }
});

/**
 * GET /api/incidents/status-counts
 * Get count of incidents by status
 */
router.get('/status-counts', async (req, res) => {
  try {
    const counts = await Incident.getCountsByStatus();
    
    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    logger.error('Failed to get status counts', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status counts'
    });
  }
});

/**
 * GET /api/incidents/owner/:ownerId
 * Get all incidents reported by a specific pet owner
 * This endpoint is used by the mobile app's "My Reports" feature
 */
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = parseInt(req.params.ownerId);
    
    if (!ownerId || isNaN(ownerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid owner ID'
      });
    }
    
    const filters = {
      status: req.query.status
    };
    
    logger.debug(`Fetching incidents for owner ${ownerId}`, filters);
    
    const incidents = await Incident.getByOwnerId(ownerId, filters);
    
    res.json({
      success: true,
      data: incidents,
      total: incidents.length,
      message: incidents.length === 0 ? 'No reports found' : undefined
    });
  } catch (error) {
    logger.error(`Failed to fetch incidents for owner`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your reports',
      details: error.message
    });
  }
});

/**
 * GET /api/incidents/:id
 * Get single incident by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.getById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ 
        error: true,
        message: 'Incident not found' 
      });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    logger.error('Failed to fetch incident', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch incident',
      details: error.message 
    });
  }
});

/**
 * POST /api/incidents/upload-images
 * Upload images and return their URLs (separate endpoint for frontend)
 */
router.post('/upload-images', upload.array('images', 5), async (req, res) => {
  try {
    logger.info('📥 Image upload request received');
    logger.debug('Uploading images', { 
      fileCount: req.files?.length || 0,
      headers: req.headers['content-type']
    });
    
    if (!req.files || req.files.length === 0) {
      logger.warn('No images provided in upload request');
      return res.status(400).json({
        success: false,
        error: true,
        message: 'No images provided'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/incident-images/${file.filename}`);
    
    logger.info(`✅ Uploaded ${imageUrls.length} images successfully`);
    logger.debug('Image URLs:', imageUrls);
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
      data: {
        images: imageUrls
      }
    });
  } catch (error) {
    logger.error('❌ Failed to upload images', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Failed to upload images',
      details: error.message
    });
  }
});

/**
 * POST /api/incidents
 * Create new incident (with optional image upload)
 * Uses optional authentication to associate report with user if logged in
 */
router.post('/', optionalAuth, upload.array('images', 5), async (req, res) => {
  try {
    logger.info('📝 Creating new incident');
    logger.debug('Request body:', { ...req.body, images: req.body.images ? '[...]' : 'none' });
    
    // Handle images from both file upload and JSON array
    let images = [];
    if (req.files && req.files.length > 0) {
      // File upload from web form
      images = req.files.map(file => `/uploads/incident-images/${file.filename}`);
      logger.debug('Images from file upload:', images.length);
    } else if (req.body.images) {
      // JSON array from mobile or API call
      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === 'string') {
        try {
          images = JSON.parse(req.body.images);
        } catch (e) {
          logger.warn('Failed to parse images string');
          images = [];
        }
      }
      logger.debug('Images from request body:', images.length);
    }
    
    // Only associate owner_id for authenticated pet owners.
    // Admin/dog_catcher tokens should NOT be written into incident_report.owner_id,
    // because that FK references pet_owner(owner_id).
    const ownerIdFromToken =
      req.user && req.user.userType === 'pet_owner' && req.user.id != null
        ? Number(req.user.id)
        : null;

    const ownerIdFromBody = req.body.owner_id != null && String(req.body.owner_id).trim() !== ''
      ? Number(req.body.owner_id)
      : null;

    const incidentData = {
      ...req.body,
      images: images,
      owner_id: Number.isFinite(ownerIdFromToken)
        ? ownerIdFromToken
        : (Number.isFinite(ownerIdFromBody) ? ownerIdFromBody : null)
    };

    const incidentId = await Incident.create(incidentData);
    
    logger.info(`✅ Incident created successfully with ID: ${incidentId}`);
    
    // Create notification for authenticated users (not anonymous emergency reports)
    if (req.user && req.user.id && req.user.userType === 'pet_owner') {
      try {
        await notifyIncidentSubmitted({
          ownerId: req.user.id,
          incidentId: incidentId,
          reportType: incidentData.incident_type || 'incident'
        });
        logger.info(`✅ Submission notification sent to owner ${req.user.id}`);
      } catch (notifError) {
        // Don't fail the request if notification fails
        logger.error('⚠️ Failed to send submission notification', notifError);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      id: incidentId,
      data: {
        id: incidentId,
        ...incidentData
      }
    });
  } catch (error) {
    logger.error('❌ Failed to create incident', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create incident',
      details: error.message
    });
  }
});

/**
 * PUT /api/incidents/:id
 * Update incident
 */
router.put('/:id', async (req, res) => {
  try {
    logger.debug(`Updating incident ${req.params.id}`, req.body);
    
    // Get current incident data before update to check for status changes
    const currentIncident = await Incident.getById(req.params.id);
    
    if (!currentIncident) {
      return res.status(404).json({
        error: true,
        message: 'Incident not found'
      });
    }
    
    const updated = await Incident.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        error: true,
        message: 'Incident not found or no changes made'
      });
    }
    
    logger.info(`Incident ${req.params.id} updated successfully`);
    
    // Send notification if status changed and incident has an owner_id (authenticated user)
    if (req.body.status && 
        req.body.status !== currentIncident.status && 
        currentIncident.owner_id) {
      try {
        await notifyIncidentStatusChange({
          ownerId: currentIncident.owner_id,
          incidentId: req.params.id,
          status: req.body.status,
          rejectionReason: req.body.rejection_reason || null
        });
        logger.info(`✅ Status change notification sent to owner ${currentIncident.owner_id}`);
      } catch (notifError) {
        // Don't fail the request if notification fails
        logger.error('⚠️ Failed to send status change notification', notifError);
      }
    }
    
    res.json({
      success: true,
      message: 'Incident updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update incident', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update incident',
      details: error.message
    });
  }
});

/**
 * DELETE /api/incidents/:id
 * Delete incident
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Incident.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        error: true,
        message: 'Incident not found'
      });
    }
    
    logger.info(`Incident ${req.params.id} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete incident', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete incident',
      details: error.message
    });
  }
});

export default router;
