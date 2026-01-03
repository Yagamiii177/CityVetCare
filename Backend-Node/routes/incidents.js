import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Incident from '../models/Incident.js';
import { query } from '../config/database.js';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth.js';
import { handleValidation, validateCoordinates } from '../middleware/validation.js';
import { createNotification } from './notifications.js';
import { logAudit } from './audit.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/incidents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'incident-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

/**
 * GET /api/incidents
 * Get all incidents with optional filters, search, and pagination
 * Query params: page, limit, search, status, priority, incident_type
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Search and filter params
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      incident_type: req.query.incident_type,
      search: req.query.search,
      limit: limit,
      offset: offset
    };

    // If user is authenticated and is a regular user, only show their own reports
    if (req.user && req.user.role === 'user') {
      filters.reporter_id = req.user.id;
    }

    console.log('📋 Fetching incidents with filters:', filters);

    const incidents = await Incident.getAll(filters);
    
    // Get total count for pagination
    const allIncidents = await Incident.getAll({ 
      status: req.query.status,
      priority: req.query.priority,
      incident_type: req.query.incident_type,
      search: req.query.search,
      reporter_id: filters.reporter_id
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
    console.error('Error fetching incidents:', error);
    res.status(500).json({ 
      success: false,
      error: true,
      message: 'Failed to fetch incidents',
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
    console.error('Error getting status counts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status counts'
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

    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch incident',
      details: error.message 
    });
  }
});

/**
 * POST /api/incidents
 * Create new incident with image uploads and offline sync support
 */
router.post('/', optionalAuth, upload.array('images', 5), [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('incident_type')
    .isIn(['bite', 'stray', 'injured', 'aggressive', 'other'])
    .withMessage('Invalid incident type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('reporter_name')
    .optional()
    .trim(),
  body('reporter_contact')
    .optional()
    .trim(),
  body('is_offline_sync')
    .optional()
    .isBoolean()
    .withMessage('is_offline_sync must be boolean'),
  handleValidation
], async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      latitude, 
      longitude, 
      incident_type,
      priority = 'medium',
      reporter_name, 
      reporter_contact,
      is_offline_sync = false
    } = req.body;

    // Validate coordinates if provided
    if (latitude && longitude) {
      const coordValidation = validateCoordinates(latitude, longitude);
      if (!coordValidation.valid) {
        return res.status(400).json({
          error: true,
          message: coordValidation.error
        });
      }
    }

    // Process uploaded images
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    const incidentData = {
      title,
      description,
      location,
      latitude,
      longitude,
      incident_type,
      priority,
      reporter_name: reporter_name || (req.user ? req.user.username : null),
      reporter_contact: reporter_contact || (req.user ? req.user.email : null),
      reporter_id: req.user ? req.user.id : null,
      incident_date: new Date(),
      images: imagePaths.length > 0 ? JSON.stringify(imagePaths) : null,
      status: 'PENDING_VERIFICATION',
      is_offline_sync,
      synced_at: is_offline_sync ? new Date() : null
    };

    const incident = await Incident.create(incidentData);
    
    // Create notification for admin and veterinarian
    const adminAndVets = await query(
      'SELECT id FROM users WHERE role IN (?, ?)',
      ['admin', 'veterinarian']
    );
    
    for (const user of adminAndVets) {
      await createNotification({
        userId: user.id,
        type: 'report_submitted',
        title: 'New Incident Report',
        message: `New ${incident_type} incident reported: ${title}`,
        relatedEntityType: 'incident',
        relatedEntityId: incident.id
      });
    }

    // Log audit
    if (req.user) {
      await logAudit({
        entityType: 'incident',
        entityId: incident.id,
        action: 'create',
        performedBy: req.user.id,
        newValue: incidentData,
        notes: is_offline_sync ? 'Created from offline sync' : null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: {
        incident: {
          ...incident,
          images: imagePaths
        }
      }
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
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
    const updated = await Incident.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ 
        error: true,
        message: 'Incident not found or no changes made' 
      });
    }

    res.json({ 
      message: 'Incident updated successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error updating incident:', error);
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

    res.json({ 
      message: 'Incident deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to delete incident',
      details: error.message 
    });
  }
});

export default router;
