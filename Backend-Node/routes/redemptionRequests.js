import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("REDEMPTION_REQUEST_ROUTES");

// GET /api/redemption-requests
router.get("/", async (req, res) => {
  try {
    const { owner_id, status } = req.query;

    let query = `
      SELECT rr.*, sa.name as animal_name, sa.species, sa.breed, 
             po.full_name as owner_name, po.email as owner_email
      FROM redemption_request rr
      JOIN stray_animals sa ON rr.stray_id = sa.animal_id
      JOIN pet_owner po ON rr.owner_id = po.owner_id
      WHERE 1=1
    `;
    const params = [];

    if (owner_id) {
      query += " AND rr.owner_id = ?";
      params.push(owner_id);
    }

    if (status) {
      query += " AND rr.status = ?";
      params.push(status);
    }

    query += " ORDER BY rr.request_date DESC";

    const [rows] = await pool.query(query, params);

    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    logger.error("Failed to list redemption requests", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to fetch redemption requests" });
  }
});

// GET /api/redemption-requests/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rr.*, sa.name as animal_name, sa.species, sa.breed, 
              po.full_name as owner_name, po.email as owner_email
       FROM redemption_request rr
       JOIN stray_animals sa ON rr.stray_id = sa.animal_id
       JOIN pet_owner po ON rr.owner_id = po.owner_id
       WHERE rr.redemption_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Redemption request not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error("Failed to fetch redemption request", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to fetch redemption request" });
  }
});

// POST /api/redemption-requests
router.post("/", async (req, res) => {
  try {
    const { stray_id, owner_id, remarks } = req.body;

    if (!stray_id || !owner_id) {
      return res
        .status(400)
        .json({ error: true, message: "stray_id and owner_id are required" });
    }

    const [animalRows] = await pool.query(
      "SELECT status FROM stray_animals WHERE animal_id = ?",
      [stray_id]
    );

    if (animalRows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Stray animal not found" });
    }

    // Create redemption request as pending
    const [result] = await pool.query(
      `INSERT INTO redemption_request (stray_id, owner_id, status, remarks) VALUES (?, ?, 'pending', ?)`,
      [stray_id, owner_id, remarks || null]
    );

    res.status(201).json({
      success: true,
      data: {
        redemption_id: result.insertId,
        stray_id,
        owner_id,
        status: "pending",
        request_date: new Date(),
        remarks: remarks || null,
      },
    });
  } catch (error) {
    logger.error("Failed to create redemption request", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to create redemption request" });
  }
});

// PUT /api/redemption-requests/:id
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ error: true, message: "status is required" });
    }

    const [result] = await pool.query(
      "UPDATE redemption_request SET status = ? WHERE redemption_id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Redemption request not found" });
    }

    res.json({ success: true, message: "Redemption request updated" });
  } catch (error) {
    logger.error("Failed to update redemption request", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to update redemption request" });
  }
});

export default router;
