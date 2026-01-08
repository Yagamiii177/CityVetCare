import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("CLINIC_MAP_ROUTES");

/**
 * GET /api/clinic-map/statistics
 * Get statistics for clinic map dashboard
 */
router.get("/statistics", async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_clinics,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_clinics,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_clinics,
        SUM(CASE WHEN status = 'Temporarily Closed' THEN 1 ELSE 0 END) as temp_closed,
        SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as mappable_clinics,
        SUM(CASE WHEN inspection_status = 'Passed' THEN 1 ELSE 0 END) as passed_inspection,
        SUM(CASE WHEN inspection_status = 'Needs Follow-up' THEN 1 ELSE 0 END) as needs_followup,
        SUM(CASE WHEN permit_expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired_permits,
        SUM(CASE WHEN permit_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_permits,
        SUM(CASE WHEN accreditation_expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired_accreditation,
        SUM(CASE WHEN accreditation_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY) THEN 1 ELSE 0 END) as expiring_accreditation
      FROM private_clinic
    `);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    logger.error("Error fetching clinic map statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

/**
 * GET /api/clinic-map/alerts
 * Get all clinic alerts (expiring permits, inspections needed, etc.)
 */
router.get("/alerts", async (req, res) => {
  try {
    const alerts = [];

    // Get expiring permits (within 30 days)
    const [expiringPermits] = await pool.query(
      `
      SELECT clinic_id, clinic_name, permit_expiry_date
      FROM private_clinic
      WHERE permit_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND status = 'Active'
      ORDER BY permit_expiry_date ASC
    `
    );

    expiringPermits.forEach((clinic) => {
      alerts.push({
        id: `permit-expiring-${clinic.clinic_id}`,
        type: "warning",
        clinic: clinic.clinic_name,
        clinicId: clinic.clinic_id,
        message: `Permit expiring on ${new Date(
          clinic.permit_expiry_date
        ).toLocaleDateString()}`,
        category: "permit",
        dueDate: clinic.permit_expiry_date,
      });
    });

    // Get expired permits
    const [expiredPermits] = await pool.query(
      `
      SELECT clinic_id, clinic_name, permit_expiry_date
      FROM private_clinic
      WHERE permit_expiry_date < CURDATE()
        AND status = 'Active'
      ORDER BY permit_expiry_date ASC
    `
    );

    expiredPermits.forEach((clinic) => {
      alerts.push({
        id: `permit-expired-${clinic.clinic_id}`,
        type: "danger",
        clinic: clinic.clinic_name,
        clinicId: clinic.clinic_id,
        message: `Permit expired on ${new Date(
          clinic.permit_expiry_date
        ).toLocaleDateString()}`,
        category: "permit",
        dueDate: clinic.permit_expiry_date,
      });
    });

    // Get expiring accreditation (within 60 days)
    const [expiringAccred] = await pool.query(
      `
      SELECT clinic_id, clinic_name, accreditation_expiry_date
      FROM private_clinic
      WHERE accreditation_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
        AND status = 'Active'
      ORDER BY accreditation_expiry_date ASC
    `
    );

    expiringAccred.forEach((clinic) => {
      alerts.push({
        id: `accred-expiring-${clinic.clinic_id}`,
        type: "warning",
        clinic: clinic.clinic_name,
        clinicId: clinic.clinic_id,
        message: `Accreditation expiring on ${new Date(
          clinic.accreditation_expiry_date
        ).toLocaleDateString()}`,
        category: "accreditation",
        dueDate: clinic.accreditation_expiry_date,
      });
    });

    // Get clinics needing follow-up inspection
    const [needsFollowup] = await pool.query(
      `
      SELECT clinic_id, clinic_name, last_inspection_date
      FROM private_clinic
      WHERE inspection_status = 'Needs Follow-up'
        AND status = 'Active'
      ORDER BY last_inspection_date ASC
    `
    );

    needsFollowup.forEach((clinic) => {
      alerts.push({
        id: `inspection-${clinic.clinic_id}`,
        type: "info",
        clinic: clinic.clinic_name,
        clinicId: clinic.clinic_id,
        message: "Inspection requires follow-up",
        category: "inspection",
      });
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    logger.error("Error fetching clinic alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

/**
 * GET /api/clinic-map/barangays
 * Get list of all barangays with clinic counts
 */
router.get("/barangays", async (req, res) => {
  try {
    const [barangays] = await pool.query(`
      SELECT 
        barangay,
        COUNT(*) as clinic_count,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count
      FROM private_clinic
      WHERE barangay IS NOT NULL
      GROUP BY barangay
      ORDER BY barangay ASC
    `);

    res.json({
      success: true,
      data: barangays,
    });
  } catch (error) {
    logger.error("Error fetching barangays:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch barangays",
      error: error.message,
    });
  }
});

/**
 * GET /api/clinic-map/services
 * Get list of all services offered across clinics
 */
router.get("/services", async (req, res) => {
  try {
    const [clinics] = await pool.query(`
      SELECT DISTINCT services
      FROM private_clinic
      WHERE services IS NOT NULL
        AND status = 'Active'
    `);

    // Extract unique services from JSON arrays
    const allServices = new Set();
    clinics.forEach((clinic) => {
      try {
        const services = JSON.parse(clinic.services);
        if (Array.isArray(services)) {
          services.forEach((service) => allServices.add(service));
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    const serviceList = Array.from(allServices).sort();

    res.json({
      success: true,
      data: serviceList,
    });
  } catch (error) {
    logger.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
});

/**
 * POST /api/clinic-map/track-view
 * Track clinic map view for analytics
 */
router.post("/track-view", async (req, res) => {
  try {
    const { clinic_id, view_type, viewed_by } = req.body;

    if (!clinic_id) {
      return res.status(400).json({
        success: false,
        message: "clinic_id is required",
      });
    }

    await pool.query(
      `INSERT INTO clinic_map_view (clinic_id, view_type, viewed_by)
       VALUES (?, ?, ?)`,
      [clinic_id, view_type || "map", viewed_by || null]
    );

    res.json({
      success: true,
      message: "View tracked successfully",
    });
  } catch (error) {
    logger.error("Error tracking clinic view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track view",
      error: error.message,
    });
  }
});

/**
 * GET /api/clinic-map/nearby
 * Get clinics near a specific location
 */
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Calculate distance using Haversine formula
    const [clinics] = await pool.query(
      `
      SELECT *,
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM private_clinic
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND status = 'Active'
      HAVING distance < ?
      ORDER BY distance ASC
    `,
      [parseFloat(lat), parseFloat(lng), parseFloat(lat), parseFloat(radius)]
    );

    res.json({
      success: true,
      data: clinics,
      count: clinics.length,
    });
  } catch (error) {
    logger.error("Error fetching nearby clinics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby clinics",
      error: error.message,
    });
  }
});

export default router;
