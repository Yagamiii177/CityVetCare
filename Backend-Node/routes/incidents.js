import express from 'express';
import Incident from '../models/Incident.js';

const router = express.Router();

/**
 * GET /api/incidents
 * Get all incidents with optional filters, search, and pagination
 * Query params: page, limit, search, status, priority
 */
router.get('/', async (req, res) => {
  try {
    // Pagination params - strictly limit to 10 per page
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Fixed at 10 records per page
    const offset = (page - 1) * limit;

    // Search and filter params
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search, // This will search across multiple fields
      limit: limit,
      offset: offset
    };

    console.log('📋 Fetching incidents with filters:', filters);

    const incidents = await Incident.getAll(filters);
    
    // Get total count for pagination
    const allIncidents = await Incident.getAll({ 
      status: req.query.status,
      priority: req.query.priority,
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

    res.json({
      success: true,
      data: incident
    });
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
 * Create new incident
 */
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received incident creation request:', req.body);
    
    // Generate title from incident_type if not provided
    let title = req.body.title;
    if (!title && req.body.incident_type) {
      if (req.body.incident_type === 'incident') {
        title = 'Incident/Bite Report';
      } else if (req.body.incident_type === 'stray') {
        title = 'Stray Animal Report';
      } else if (req.body.incident_type === 'lost') {
        title = 'Lost Pet Report';
      } else {
        title = 'Animal Report';
      }
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({ 
        error: true,
        message: 'Title or incident_type is required' 
      });
    }

    // Add title to request body
    const incidentData = {
      ...req.body,
      title: title
    };

    console.log('📦 Creating incident with data:', incidentData);

    const incident = await Incident.create(incidentData);
    
    console.log('✅ Incident created successfully:', incident.id);
    
    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      id: incident.id,
      data: incident
    });
  } catch (error) {
    console.error('❌ Error creating incident:', error);
    res.status(500).json({ 
      error: true,
      success: false,
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
    console.log('🔄 Updating incident:', req.params.id, 'with data:', req.body);
    const updated = await Incident.update(req.params.id, req.body);
    
    if (!updated) {
      console.log('❌ Incident not found or no changes made');
      return res.status(404).json({ 
        error: true,
        message: 'Incident not found or no changes made' 
      });
    }

    console.log('✅ Incident updated successfully:', req.params.id);
    res.json({ 
      success: true,
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
