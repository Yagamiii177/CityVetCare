import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";
import { persistIncomingImages } from "../utils/imageStorage.js";

const router = express.Router();
const logger = new Logger("REDEMPTION_REQUEST_ROUTES");

const ADOPTION_STRAY_STATUSES = ["adoption", "adopted"];

const normalizeStrayImagesToPhoto = (images) => {
  if (!images) return null;
  try {
    if (Array.isArray(images)) return images[0] || null;
    if (typeof images === "string") {
      const trimmed = images.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const arr = JSON.parse(trimmed);
        return Array.isArray(arr) ? arr[0] || null : null;
      }
      return trimmed;
    }
    if (typeof images === "object") {
      const vals = Object.values(images).filter(Boolean);
      return vals[0] || null;
    }
  } catch {
    // ignore
  }
  return null;
};

// GET /api/redemption-requests
router.get("/", async (req, res) => {
  try {
    const { owner_id, status } = req.query;

    // Auto-cleanup: if the related stray animal is already in adoption/adopted,
    // remove its redemption requests and never show them in the table.
    try {
      const placeholders = ADOPTION_STRAY_STATUSES.map(() => "?").join(",");
      await pool.query(
        `DELETE rr
         FROM redemption_request rr
         JOIN stray_animals sa ON rr.stray_id = sa.animal_id
         WHERE LOWER(sa.status) IN (${placeholders})`,
        ADOPTION_STRAY_STATUSES
      );
    } catch (cleanupError) {
      // Don't block listing if cleanup fails
      logger.warn("Cleanup (adoption) failed", cleanupError);
    }

    let query = `
            SELECT rr.*,
             sa.name as animal_name,
              sa.species, sa.breed, sa.sex, sa.color, sa.markings,
              sa.images, sa.rfid, sa.location_captured, sa.date_captured, sa.registration_date,
              sa.status AS stray_status,
             po.full_name as owner_name, po.email as owner_email, po.address as owner_address,
             COALESCE(rr.owner_contact, po.contact_number) AS owner_contact,
             p.capture_count AS capture_count
      FROM redemption_request rr
      JOIN stray_animals sa ON rr.stray_id = sa.animal_id
      JOIN pet_owner po ON rr.owner_id = po.owner_id
      LEFT JOIN pet p ON p.rfid = sa.rfid
      WHERE 1=1
    `;
    const params = [];

    // Never include redemption requests for adoption/adopted strays
    query += ` AND LOWER(sa.status) NOT IN (${ADOPTION_STRAY_STATUSES.map(
      () => "?"
    ).join(",")})`;
    params.push(...ADOPTION_STRAY_STATUSES);

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
    // If this request belongs to an adoption/adopted stray, delete it and return 404
    try {
      const placeholders = ADOPTION_STRAY_STATUSES.map(() => "?").join(",");
      await pool.query(
        `DELETE rr
         FROM redemption_request rr
         JOIN stray_animals sa ON rr.stray_id = sa.animal_id
         WHERE rr.redemption_id = ? AND LOWER(sa.status) IN (${placeholders})`,
        [req.params.id, ...ADOPTION_STRAY_STATUSES]
      );
    } catch (cleanupError) {
      logger.warn("Cleanup (adoption) for single request failed", cleanupError);
    }

    const [rows] = await pool.query(
      `SELECT rr.*,
              sa.name as animal_name,
              sa.species, sa.breed, sa.sex, sa.color, sa.markings,
              sa.images, sa.rfid, sa.location_captured, sa.date_captured, sa.registration_date,
              sa.status AS stray_status,
              po.full_name as owner_name, po.email as owner_email, po.address as owner_address,
              COALESCE(rr.owner_contact, po.contact_number) AS owner_contact,
              p.capture_count AS capture_count
       FROM redemption_request rr
       JOIN stray_animals sa ON rr.stray_id = sa.animal_id
       JOIN pet_owner po ON rr.owner_id = po.owner_id
       LEFT JOIN pet p ON p.rfid = sa.rfid
       WHERE rr.redemption_id = ?
         AND LOWER(sa.status) NOT IN (${ADOPTION_STRAY_STATUSES.map(
           () => "?"
         ).join(",")})`,
      [req.params.id, ...ADOPTION_STRAY_STATUSES]
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
    const {
      stray_id,
      owner_id,
      remarks,
      contact_number,
      owner_contact,
      proof_images,
    } = req.body;

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

    const strayStatus = String(animalRows[0]?.status || "").toLowerCase();
    if (ADOPTION_STRAY_STATUSES.includes(strayStatus)) {
      return res.status(409).json({
        error: true,
        message: "Redemption request not allowed: stray animal is in adoption",
      });
    }

    // Normalize proof images to server-served paths.
    // Accepts base64 data URLs, existing /uploads paths, or full URLs.
    const persistedProofImages = await persistIncomingImages(proof_images, {
      subdir: "redemption-proofs",
      prefix: "proof",
      maxBytes: 6 * 1024 * 1024,
    });

    if (proof_images && persistedProofImages.length === 0) {
      return res.status(400).json({
        error: true,
        message:
          "Invalid proof images. Please upload at least one valid image.",
      });
    }

    // Create redemption request as pending
    const proofImagesStr = persistedProofImages.length
      ? JSON.stringify(persistedProofImages)
      : null;
    const [result] = await pool.query(
      `INSERT INTO redemption_request (stray_id, owner_id, status, remarks, owner_contact, proof_images) VALUES (?, ?, 'pending', ?, ?, ?)`,
      [
        stray_id,
        owner_id,
        remarks || null,
        owner_contact || contact_number || null,
        proofImagesStr,
      ]
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
        owner_contact: owner_contact || contact_number || null,
        proof_images: proofImagesStr,
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

// POST /api/redemption-requests/:id/claim
// Moves the stray animal into the pet table once the request is approved.
router.post("/:id/claim", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { rfid, incrementCaptureCount } = req.body || {};

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT rr.redemption_id, rr.stray_id, rr.owner_id, rr.status AS redemption_status,
              sa.rfid AS stray_rfid, sa.name, sa.species, sa.breed, sa.sex, sa.color, sa.markings,
              sa.images
       FROM redemption_request rr
       JOIN stray_animals sa ON rr.stray_id = sa.animal_id
       WHERE rr.redemption_id = ?
       FOR UPDATE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: true, message: "Redemption request not found" });
    }

    const rr = rows[0];
    const statusLower = String(rr.redemption_status || "").toLowerCase();
    if (statusLower !== "approved") {
      await connection.rollback();
      return res.status(409).json({
        error: true,
        message: "Pet can only be claimed after the request is approved",
      });
    }

    const finalRfid = String(rfid || rr.stray_rfid || "").trim();
    if (!finalRfid) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: true, message: "RFID is required to claim this pet" });
    }

    // If the stray doesn't have RFID yet, store it.
    if (!rr.stray_rfid) {
      await connection.query(
        "UPDATE stray_animals SET rfid = ? WHERE animal_id = ?",
        [finalRfid, rr.stray_id]
      );
    }

    // Create pet record (avoid duplicates per owner+rfid)
    const [existingPet] = await connection.query(
      "SELECT pet_id FROM pet WHERE owner_id = ? AND rfid = ? LIMIT 1",
      [rr.owner_id, finalRfid]
    );

    let petId;
    const photo = normalizeStrayImagesToPhoto(rr.images);

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
          rr.name || null,
          rr.species || null,
          rr.breed || null,
          rr.sex || null,
          rr.color || null,
          rr.markings || null,
          photo,
          petId,
        ]
      );
    } else {
      const [insertPet] = await connection.query(
        `INSERT INTO pet (owner_id, rfid, name, species, breed, age, sex, color, markings, photo, status)
         VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 'owned')`,
        [
          rr.owner_id,
          finalRfid,
          rr.name || "Unnamed",
          rr.species || "Unknown",
          rr.breed || null,
          rr.sex || null,
          rr.color || null,
          rr.markings || null,
          photo,
        ]
      );
      petId = insertPet.insertId;

      // Best-effort: increment owner's pet_count
      await connection.query(
        "UPDATE pet_owner SET pet_count = pet_count + 1 WHERE owner_id = ?",
        [rr.owner_id]
      );
    }

    // Increment capture count for this pet only if RFID was manually entered
    if (incrementCaptureCount) {
      await connection.query(
        "UPDATE pet SET capture_count = capture_count + 1 WHERE pet_id = ?",
        [petId]
      );
    }

    // Mark redemption request as archived
    await connection.query(
      "UPDATE redemption_request SET status = 'archived' WHERE redemption_id = ?",
      [rr.redemption_id]
    );

    // Mark stray as claimed (requires DB enum to include 'claimed')
    await connection.query(
      "UPDATE stray_animals SET status = 'claimed' WHERE animal_id = ?",
      [rr.stray_id]
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
    logger.error("Failed to claim pet", error);
    res.status(500).json({ error: true, message: "Unable to claim pet" });
  } finally {
    connection.release();
  }
});

export default router;
