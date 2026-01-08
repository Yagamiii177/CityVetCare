import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("DASHBOARD_ROUTES");

const toDateKey = (d) => {
  try {
    return typeof d === "string"
      ? d.slice(0, 10)
      : d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

const buildDateRange = (days) => {
  const out = [];
  const now = new Date();
  // Use local day boundaries; values are used as labels only.
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    out.push(toDateKey(d));
  }
  return out.filter(Boolean);
};

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const rangeDays = 30;
    const dates = buildDateRange(rangeDays);

    const [[totalStraysRow]] = await pool.query(
      "SELECT COUNT(*) AS total FROM stray_animals"
    );

    const [statusRows] = await pool.query(
      "SELECT LOWER(COALESCE(status, 'captured')) AS status, COUNT(*) AS count FROM stray_animals GROUP BY LOWER(COALESCE(status, 'captured'))"
    );

    const [adoptionStatusRows] = await pool.query(
      "SELECT LOWER(COALESCE(status, 'pending')) AS status, COUNT(*) AS count FROM adoption_request GROUP BY LOWER(COALESCE(status, 'pending'))"
    );

    const [redemptionStatusRows] = await pool.query(
      "SELECT LOWER(COALESCE(status, 'pending')) AS status, COUNT(*) AS count FROM redemption_request GROUP BY LOWER(COALESCE(status, 'pending'))"
    );

    // Stray registrations by day (registration_date preferred, fallback to created_at)
    const [registrationRows] = await pool.query(
      `SELECT DATE(COALESCE(registration_date, created_at)) AS d, COUNT(*) AS count
       FROM stray_animals
       WHERE COALESCE(registration_date, DATE(created_at)) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(COALESCE(registration_date, created_at))`,
      [rangeDays - 1]
    );

    // Adoption approvals by day (approved_date), and total requests by day (request_date)
    const [adoptionRequestRows] = await pool.query(
      `SELECT DATE(request_date) AS d,
              SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN LOWER(status) = 'approved' THEN 1 ELSE 0 END) AS approved,
              SUM(CASE WHEN LOWER(status) = 'rejected' THEN 1 ELSE 0 END) AS rejected,
              COUNT(*) AS total
       FROM adoption_request
       WHERE DATE(request_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(request_date)`,
      [rangeDays - 1]
    );

    // Optional: approval date series if the schema includes approved_date.
    // Older schemas track only request_date + status.
    let adoptionApprovedRows = [];
    try {
      const [approvedDateCols] = await pool.query(
        "SHOW COLUMNS FROM adoption_request LIKE 'approved_date'"
      );
      if (approvedDateCols?.length) {
        const [rows] = await pool.query(
          `SELECT DATE(approved_date) AS d, COUNT(*) AS approved
           FROM adoption_request
           WHERE LOWER(status) = 'approved'
             AND approved_date IS NOT NULL
             AND DATE(approved_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
           GROUP BY DATE(approved_date)`,
          [rangeDays - 1]
        );
        adoptionApprovedRows = rows || [];
      }
    } catch (colCheckError) {
      logger.warn(
        "Skipping approved_date series (schema does not support it)",
        colCheckError
      );
      adoptionApprovedRows = [];
    }

    // Recent activity (last 6 combined)
    const [recentStrays] = await pool.query(
      `SELECT animal_id, created_at
       FROM stray_animals
       ORDER BY created_at DESC
       LIMIT 6`
    );

    const [recentAdoptionReq] = await pool.query(
      `SELECT adoption_id, request_date
       FROM adoption_request
       ORDER BY request_date DESC
       LIMIT 6`
    );

    const [recentRedemptionReq] = await pool.query(
      `SELECT redemption_id, request_date
       FROM redemption_request
       ORDER BY request_date DESC
       LIMIT 6`
    );

    const statusCounts = Object.fromEntries(
      (statusRows || []).map((r) => [r.status, Number(r.count) || 0])
    );

    const adoptionRequestCounts = Object.fromEntries(
      (adoptionStatusRows || []).map((r) => [r.status, Number(r.count) || 0])
    );

    const redemptionRequestCounts = Object.fromEntries(
      (redemptionStatusRows || []).map((r) => [r.status, Number(r.count) || 0])
    );

    const byDate = new Map(dates.map((d) => [d, { date: d }]));

    for (const r of registrationRows || []) {
      const key = toDateKey(r.d);
      if (!key || !byDate.has(key)) continue;
      byDate.get(key).registeredStrays = Number(r.count) || 0;
    }

    for (const r of adoptionRequestRows || []) {
      const key = toDateKey(r.d);
      if (!key || !byDate.has(key)) continue;
      byDate.get(key).adoptionRequests = Number(r.total) || 0;
      byDate.get(key).adoptionPending = Number(r.pending) || 0;
      byDate.get(key).adoptionApproved = Number(r.approved) || 0;
      byDate.get(key).adoptionRejected = Number(r.rejected) || 0;
    }

    // Override approved series using approved_date-based aggregation when available.
    for (const r of adoptionApprovedRows || []) {
      const key = toDateKey(r.d);
      if (!key || !byDate.has(key)) continue;
      byDate.get(key).adoptionApproved = Number(r.approved) || 0;
    }

    const timeSeries = Array.from(byDate.values()).map((row) => ({
      date: row.date,
      registeredStrays: row.registeredStrays ?? 0,
      adoptionRequests: row.adoptionRequests ?? 0,
      adoptionApproved: row.adoptionApproved ?? 0,
      adoptionPending: row.adoptionPending ?? 0,
      adoptionRejected: row.adoptionRejected ?? 0,
    }));

    const activitiesRaw = [
      ...(recentStrays || []).map((r) => ({
        ts: r.created_at,
        type: "stray_registered",
        label: `New stray registered (#${r.animal_id})`,
      })),
      ...(recentAdoptionReq || []).map((r) => ({
        ts: r.request_date,
        type: "adoption_requested",
        label: `New adoption request (#${r.adoption_id})`,
      })),
      ...(recentRedemptionReq || []).map((r) => ({
        ts: r.request_date,
        type: "redemption_requested",
        label: `New redemption request (#${r.redemption_id})`,
      })),
    ]
      .filter((a) => a.ts)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 6)
      .map((a, idx) => ({
        id: idx + 1,
        type: a.type,
        action: a.label,
        timestamp: a.ts,
      }));

    res.json({
      success: true,
      data: {
        metrics: {
          totalStrays: Number(totalStraysRow?.total) || 0,
          statusCounts,
          adoptionRequestCounts,
          redemptionRequestCounts,
        },
        timeSeries,
        recentActivities: activitiesRaw,
      },
    });
  } catch (error) {
    logger.error("Failed to build dashboard stats", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to fetch dashboard stats" });
  }
});

export default router;
