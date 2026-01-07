import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("ADMIN_DASHBOARD");

/**
 * GET /api/admin-dashboard/stats
 * Get comprehensive statistics for admin dashboard
 */
router.get("/stats", async (req, res) => {
  try {
    // Get clinic statistics
    const [clinicStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) as suspended
      FROM private_clinic
    `);

    res.json({
      success: true,
      data: clinicStats[0],
    });
  } catch (error) {
    logger.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin-dashboard/pending-clinics
 * Get all pending clinics for approval
 */
router.get("/pending-clinics", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const [clinics] = await pool.query(
      `
      SELECT 
        clinic_id,
        clinic_name,
        head_veterinarian,
        email,
        contact_number,
        address,
        barangay,
        license_number,
        services,
        latitude,
        longitude,
        date_created,
        status,
        DATEDIFF(CURDATE(), date_created) as days_pending
      FROM private_clinic
      WHERE status = 'Pending'
      ORDER BY date_created ASC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    // Transform services JSON
    const transformedClinics = clinics.map((clinic) => ({
      ...clinic,
      services: clinic.services ? JSON.parse(clinic.services) : [],
    }));

    res.json({
      success: true,
      data: transformedClinics,
    });
  } catch (error) {
    logger.error("Error fetching pending clinics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending clinics",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin-dashboard/activity
 * Get recent activity log
 */
router.get("/activity", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent status changes and new registrations
    const [activities] = await pool.query(
      `
      SELECT 
        clinic_id,
        clinic_name,
        status,
        date_created,
        date_updated,
        'registration' as activity_type
      FROM private_clinic
      ORDER BY date_updated DESC, date_created DESC
      LIMIT ?
    `,
      [limit]
    );

    // Transform activities
    const transformedActivities = activities.map((activity) => {
      let action = "";
      let icon = "";
      let color = "";

      if (activity.status === "Active") {
        action = "approved";
        icon = "check";
        color = "green";
      } else if (activity.status === "Pending") {
        action = "submitted registration";
        icon = "clock";
        color = "amber";
      } else if (activity.status === "Rejected") {
        action = "rejected";
        icon = "x";
        color = "red";
      } else if (activity.status === "Inactive") {
        action = "deactivated";
        icon = "ban";
        color = "gray";
      }

      return {
        id: `${activity.clinic_id}-${
          activity.date_updated || activity.date_created
        }`,
        clinicId: activity.clinic_id,
        clinicName: activity.clinic_name,
        action,
        icon,
        color,
        timestamp: activity.date_updated || activity.date_created,
        description: `${activity.clinic_name} ${action}`,
      };
    });

    res.json({
      success: true,
      data: transformedActivities,
    });
  } catch (error) {
    logger.error("Error fetching activity log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity log",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin-dashboard/analytics
 * Get analytics data for charts and trends
 */
router.get("/analytics", async (req, res) => {
  try {
    // Get registration trends (last 12 months)
    const [registrationTrends] = await pool.query(`
      SELECT 
        DATE_FORMAT(date_created, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM private_clinic
      WHERE date_created >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date_created, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get status distribution
    const [statusDistribution] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM private_clinic
      GROUP BY status
    `);

    // Get top barangays
    const [topBarangays] = await pool.query(`
      SELECT 
        barangay,
        COUNT(*) as count
      FROM private_clinic
      WHERE barangay IS NOT NULL AND barangay != ''
      GROUP BY barangay
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get approval rate
    const [approvalRate] = await pool.query(`
      SELECT 
        COUNT(*) as total_processed,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        ROUND(SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) * 100.0 / 
          NULLIF(SUM(CASE WHEN status IN ('Active', 'Rejected') THEN 1 ELSE 0 END), 0), 2) as approval_percentage
      FROM private_clinic
      WHERE status IN ('Active', 'Rejected')
    `);

    res.json({
      success: true,
      data: {
        registrationTrends,
        statusDistribution,
        topBarangays,
        approvalRate: approvalRate[0] || {},
      },
    });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin-dashboard/alerts
 * Get system alerts for admin attention
 */
router.get("/alerts", async (req, res) => {
  try {
    const alerts = [];

    // Alert 1: Clinics pending for more than 7 days
    const [longPending] = await pool.query(`
      SELECT 
        clinic_id,
        clinic_name,
        date_created,
        DATEDIFF(CURDATE(), date_created) as days_pending
      FROM private_clinic
      WHERE status = 'Pending' 
        AND DATEDIFF(CURDATE(), date_created) > 7
      ORDER BY date_created ASC
    `);

    longPending.forEach((clinic) => {
      alerts.push({
        id: `pending-long-${clinic.clinic_id}`,
        type: "warning",
        priority: "high",
        title: "Clinic Pending Review",
        message: `${clinic.clinic_name} has been pending for ${clinic.days_pending} days`,
        clinicId: clinic.clinic_id,
        clinicName: clinic.clinic_name,
        category: "approval",
        timestamp: clinic.date_created,
        dismissible: true,
      });
    });

    // Alert 2: Clinics with missing coordinates
    const [missingCoordinates] = await pool.query(`
      SELECT 
        clinic_id,
        clinic_name,
        status
      FROM private_clinic
      WHERE (latitude IS NULL OR longitude IS NULL)
        AND status = 'Active'
      LIMIT 10
    `);

    if (missingCoordinates.length > 0) {
      alerts.push({
        id: "missing-coordinates",
        type: "info",
        priority: "medium",
        title: "Clinics Missing Location Data",
        message: `${missingCoordinates.length} active clinic(s) are missing GPS coordinates`,
        category: "data-quality",
        count: missingCoordinates.length,
        dismissible: true,
      });
    }

    // Alert 3: Check for duplicate clinic names (potential duplicates)
    const [duplicateNames] = await pool.query(`
      SELECT 
        clinic_name,
        COUNT(*) as count
      FROM private_clinic
      GROUP BY clinic_name
      HAVING COUNT(*) > 1
    `);

    duplicateNames.forEach((duplicate) => {
      alerts.push({
        id: `duplicate-${duplicate.clinic_name}`,
        type: "warning",
        priority: "medium",
        title: "Potential Duplicate Registration",
        message: `${duplicate.count} clinics with name: ${duplicate.clinic_name}`,
        category: "duplicate",
        dismissible: true,
      });
    });

    // Alert 4: Recent rejections (last 7 days)
    const [recentRejections] = await pool.query(`
      SELECT COUNT(*) as count
      FROM private_clinic
      WHERE status = 'Rejected'
        AND date_updated >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    if (recentRejections[0].count > 0) {
      alerts.push({
        id: "recent-rejections",
        type: "info",
        priority: "low",
        title: "Recent Rejections",
        message: `${recentRejections[0].count} clinic(s) rejected in the last 7 days`,
        category: "stats",
        dismissible: true,
      });
    }

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    logger.error("Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/admin-dashboard/clinics/:id/approve
 * Approve a pending clinic
 */
router.patch("/clinics/:id/approve", async (req, res) => {
  try {
    const clinicId = req.params.id;

    const [result] = await pool.query(
      `UPDATE private_clinic 
       SET status = 'Active', date_updated = CURRENT_TIMESTAMP
       WHERE clinic_id = ? AND status = 'Pending'`,
      [clinicId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found or already processed",
      });
    }

    // Get updated clinic
    const [clinic] = await pool.query(
      `SELECT * FROM private_clinic WHERE clinic_id = ?`,
      [clinicId]
    );

    res.json({
      success: true,
      message: "Clinic approved successfully",
      data: clinic[0],
    });
  } catch (error) {
    logger.error("Error approving clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve clinic",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/admin-dashboard/clinics/:id/reject
 * Reject a pending clinic
 */
router.patch("/clinics/:id/reject", async (req, res) => {
  try {
    const clinicId = req.params.id;
    const { reason } = req.body;

    const [result] = await pool.query(
      `UPDATE private_clinic 
       SET status = 'Rejected', 
           rejection_reason = ?,
           date_updated = CURRENT_TIMESTAMP
       WHERE clinic_id = ? AND status = 'Pending'`,
      [reason || null, clinicId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found or already processed",
      });
    }

    // Get updated clinic
    const [clinic] = await pool.query(
      `SELECT * FROM private_clinic WHERE clinic_id = ?`,
      [clinicId]
    );

    res.json({
      success: true,
      message: "Clinic rejected",
      data: clinic[0],
    });
  } catch (error) {
    logger.error("Error rejecting clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject clinic",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/admin-dashboard/alerts/:id/dismiss
 * Dismiss an alert
 */
router.patch("/alerts/:id/dismiss", async (req, res) => {
  try {
    // For now, just return success
    // In a full implementation, you'd store dismissed alerts in a table
    res.json({
      success: true,
      message: "Alert dismissed",
    });
  } catch (error) {
    logger.error("Error dismissing alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dismiss alert",
      error: error.message,
    });
  }
});

export default router;
