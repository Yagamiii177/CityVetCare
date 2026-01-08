import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";
import { persistIncomingImage } from "../utils/imageStorage.js";

const router = express.Router();
const logger = new Logger("ADOPTION_REQUEST_ROUTES");

const normalizeStrayImagesToPhoto = (images) => {
  if (!images) return null;
  try {
    if (Array.isArray(images)) return images.find(Boolean) || null;
    if (typeof images === "string") {
      const trimmed = images.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.find(Boolean) || null;
      }
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          return Object.values(parsed).find(Boolean) || null;
        }
      }
      return trimmed;
    }
    if (typeof images === "object") {
      return Object.values(images).find(Boolean) || null;
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

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

    // Store applicant details as JSON if provided.
    // If applicant_details contains an ID image as a base64 data URL, persist it to /uploads.
    let normalizedApplicantDetails = null;
    if (applicant_details && typeof applicant_details === "object") {
      normalizedApplicantDetails = { ...applicant_details };
      if (normalizedApplicantDetails.validIdImage) {
        const persisted = await persistIncomingImage(
          normalizedApplicantDetails.validIdImage,
          { subdir: "adoption-ids", prefix: "adopter-id" }
        );
        if (!persisted) {
          return res.status(400).json({
            error: true,
            message: "Invalid validIdImage. Please upload a valid image.",
          });
        }
        normalizedApplicantDetails.validIdImage = persisted;
      }
    }

    const detailsJson = normalizedApplicantDetails
      ? JSON.stringify(normalizedApplicantDetails)
      : null;

    const [result] = await pool.query(
      `INSERT INTO adoption_request (stray_id, adopter_id, status, applicant_details) 
       VALUES (?, ?, 'pending', ?)`,
      [stray_id, adopter_id, detailsJson]
    );

    res.status(201).json({
      success: true,
      data: {
        adoption_id: result.insertId,
        stray_id,
        adopter_id,
        status: "pending",
        request_date: new Date(),
        applicant_details: detailsJson ? JSON.parse(detailsJson) : null,
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
  const connection = await pool.getConnection();
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: true,
        message: "status is required",
      });
    }

    const normalized = String(status || "").toLowerCase();
    if (!["pending", "approved", "rejected", "archived"].includes(normalized)) {
      return res.status(400).json({
        error: true,
        message:
          "Invalid status. Allowed: pending, approved, rejected, archived",
      });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT adoption_id, stray_id, adopter_id, status
       FROM adoption_request
       WHERE adoption_id = ?
       FOR UPDATE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: true,
        message: "Adoption request not found",
      });
    }

    const ar = rows[0];

    await connection.query(
      "UPDATE adoption_request SET status = ? WHERE adoption_id = ?",
      [normalized, req.params.id]
    );

    if (normalized === "approved") {
      // Mark the animal as adopted so it no longer appears in adoption listings.
      await connection.query(
        "UPDATE stray_animals SET status = 'adopted' WHERE animal_id = ?",
        [ar.stray_id]
      );

      // Reject other pending requests for the same animal.
      await connection.query(
        "UPDATE adoption_request SET status = 'rejected' WHERE stray_id = ? AND adoption_id <> ? AND status = 'pending'",
        [ar.stray_id, ar.adoption_id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Adoption request updated",
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    logger.error("Failed to update adoption request", error);
    res.status(500).json({
      error: true,
      message: "Unable to update adoption request",
    });
  } finally {
    connection.release();
  }
});

// POST /api/adoption-requests/:id/claim
// Moves the adopted stray animal into the pet table for the adopter.
router.post("/:id/claim", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { rfid } = req.body || {};

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT ar.adoption_id, ar.stray_id, ar.adopter_id, ar.status AS adoption_status,
              sa.rfid AS stray_rfid, sa.name, sa.species, sa.breed, sa.sex, sa.color, sa.markings,
              sa.images
       FROM adoption_request ar
       JOIN stray_animals sa ON ar.stray_id = sa.animal_id
       WHERE ar.adoption_id = ?
       FOR UPDATE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: true, message: "Adoption request not found" });
    }

    const ar = rows[0];
    const statusLower = String(ar.adoption_status || "").toLowerCase();
    if (statusLower !== "approved") {
      await connection.rollback();
      return res.status(409).json({
        error: true,
        message:
          "Pet can only be claimed after the adoption request is approved",
      });
    }

    const finalRfid = String(rfid || ar.stray_rfid || "").trim();
    if (!finalRfid) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: true, message: "RFID is required to claim this pet" });
    }

    // If the stray doesn't have RFID yet, store it.
    if (!ar.stray_rfid) {
      await connection.query(
        "UPDATE stray_animals SET rfid = ? WHERE animal_id = ?",
        [finalRfid, ar.stray_id]
      );
    }

    // Create pet record (avoid duplicates per owner+rfid)
    const [existingPet] = await connection.query(
      "SELECT pet_id FROM pet WHERE owner_id = ? AND rfid = ? LIMIT 1",
      [ar.adopter_id, finalRfid]
    );

    let petId;
    const photo = normalizeStrayImagesToPhoto(ar.images);

    if (existingPet.length > 0) {
      petId = existingPet[0].pet_id;
      await connection.query(
        `UPDATE pet
         SET name = COALESCE(?, name),
             species = COALESCE(?, species),
             breed = COALESCE(?, breed),
             sex = COALESCE(?, sex),
             color = COALESCE(?, color),
             markings = COALESCE(?, markings),
             photo = COALESCE(?, photo)
         WHERE pet_id = ?`,
        [
          ar.name || null,
          ar.species || null,
          ar.breed || null,
          ar.sex || null,
          ar.color || null,
          ar.markings || null,
          photo,
          petId,
        ]
      );
    } else {
      const [insertPet] = await connection.query(
        `INSERT INTO pet (owner_id, rfid, name, species, breed, age, sex, color, markings, photo, status)
         VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 'owned')`,
        [
          ar.adopter_id,
          finalRfid,
          ar.name || "Unnamed",
          ar.species || "Unknown",
          ar.breed || null,
          ar.sex || null,
          ar.color || null,
          ar.markings || null,
          photo,
        ]
      );
      petId = insertPet.insertId;

      // Best-effort: increment owner's pet_count
      await connection.query(
        "UPDATE pet_owner SET pet_count = pet_count + 1 WHERE owner_id = ?",
        [ar.adopter_id]
      );
    }

    // Archive adoption request and mark stray as claimed
    await connection.query(
      "UPDATE adoption_request SET status = 'archived' WHERE adoption_id = ?",
      [ar.adoption_id]
    );
    await connection.query(
      "UPDATE stray_animals SET status = 'claimed' WHERE animal_id = ?",
      [ar.stray_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Pet claimed successfully",
      data: { pet_id: petId, rfid: finalRfid },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    logger.error("Failed to claim pet (adoption)", error);
    res.status(500).json({ error: true, message: "Unable to claim pet" });
  } finally {
    connection.release();
  }
});

export default router;
