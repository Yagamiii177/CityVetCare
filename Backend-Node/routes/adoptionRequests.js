import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("ADOPTION_REQUEST_ROUTES");

// GET /api/adoption-requests
router.get("/", async (req, res) => {
  try {
    const { adopter_id, status } = req.query;

    let query = `
      SELECT ar.*, sa.name as animal_name, sa.species, sa.breed, 
             po.full_name as adopter_name, po.email as adopter_email
      FROM adoption_request ar
      JOIN stray_animals sa ON ar.stray_id = sa.animal_id
      JOIN pet_owner po ON ar.adopter_id = po.owner_id
      WHERE 1=1
    `;
    const params = [];

    if (adopter_id) {
      query += " AND ar.adopter_id = ?";
      params.push(adopter_id);
    }

    if (status) {
      query += " AND ar.status = ?";
      params.push(status);
    }

    query += " ORDER BY ar.request_date DESC";

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    logger.error("Failed to list adoption requests", error);
    res.status(500).json({
      error: true,
      message: "Unable to fetch adoption requests",
    });
  }
});

// GET /api/adoption-requests/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ar.*, sa.name as animal_name, sa.species, sa.breed, 
              po.full_name as adopter_name, po.email as adopter_email
       FROM adoption_request ar
       JOIN stray_animals sa ON ar.stray_id = sa.animal_id
       JOIN pet_owner po ON ar.adopter_id = po.owner_id
       WHERE ar.adoption_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Adoption request not found",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error("Failed to fetch adoption request", error);
    res.status(500).json({
      error: true,
      message: "Unable to fetch adoption request",
    });
  }
});

// POST /api/adoption-requests
router.post("/", async (req, res) => {
  try {
    const { stray_id, adopter_id, applicant_details } = req.body;

    if (!stray_id || !adopter_id) {
      return res.status(400).json({
        error: true,
        message: "stray_id and adopter_id are required",
      });
    }

    // Check if stray animal exists and has adoption status
    const [animalRows] = await pool.query(
      "SELECT status FROM stray_animals WHERE animal_id = ?",
      [stray_id]
    );

    if (animalRows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    if (animalRows[0].status !== "adoption") {
      return res.status(400).json({
        error: true,
        message: "This animal is not available for adoption",
      });
    }

    // Store applicant details as JSON
    const detailsJson = applicant_details
      ? JSON.stringify(applicant_details)
      : null;

    const [result] = await pool.query(
      `INSERT INTO adoption_request (stray_id, adopter_id, status) 
       VALUES (?, ?, 'pending')`,
      [stray_id, adopter_id]
    );

    // If you want to store applicant_details, you'd need to add a column to adoption_request table
    // For now, we'll just create the basic request

    res.status(201).json({
      success: true,
      data: {
        adoption_id: result.insertId,
        stray_id,
        adopter_id,
        status: "pending",
        request_date: new Date(),
      },
    });
  } catch (error) {
    logger.error("Failed to create adoption request", error);
    res.status(500).json({
      error: true,
      message: "Unable to create adoption request",
    });
  }
});

// PUT /api/adoption-requests/:id
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: true,
        message: "status is required",
      });
    }

    const [result] = await pool.query(
      "UPDATE adoption_request SET status = ? WHERE adoption_id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: "Adoption request not found",
      });
    }

    res.json({
      success: true,
      message: "Adoption request updated",
    });
  } catch (error) {
    logger.error("Failed to update adoption request", error);
    res.status(500).json({
      error: true,
      message: "Unable to update adoption request",
    });
  }
});

export default router;
