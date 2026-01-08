import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";
import { persistIncomingImage } from "../utils/imageStorage.js";

const router = express.Router();
const logger = new Logger("ADOPTION_REQUEST_ROUTES");

let attemptedApplicantDetailsColumnFix = false;

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

    let result;
    try {
      const [insertResult] = await pool.query(
        `INSERT INTO adoption_request (stray_id, adopter_id, status, applicant_details) 
         VALUES (?, ?, 'pending', ?)`,
        [stray_id, adopter_id, detailsJson]
      );
      result = insertResult;
    } catch (e) {
      const msg = String(e?.message || "");
      const isMissingApplicantDetailsColumn =
        e?.code === "ER_BAD_FIELD_ERROR" && msg.includes("applicant_details");

      if (
        isMissingApplicantDetailsColumn &&
        !attemptedApplicantDetailsColumnFix
      ) {
        attemptedApplicantDetailsColumnFix = true;
        logger.warn(
          "Missing applicant_details column on adoption_request; attempting to auto-fix via ALTER TABLE."
        );

        let altered = false;
        try {
          await pool.query(
            "ALTER TABLE adoption_request ADD COLUMN applicant_details JSON NULL AFTER status"
          );
          altered = true;
        } catch (alterErr) {
          // Fallback for DBs that don't support JSON as a native type.
          try {
            await pool.query(
              "ALTER TABLE adoption_request ADD COLUMN applicant_details TEXT NULL AFTER status"
            );
            altered = true;
          } catch (alterErr2) {
            logger.error(
              "Failed to auto-add applicant_details column. Please run Backend-Node migrations.",
              alterErr2
            );
          }
        }

        if (altered) {
          const [retryResult] = await pool.query(
            `INSERT INTO adoption_request (stray_id, adopter_id, status, applicant_details) 
             VALUES (?, ?, 'pending', ?)`,
            [stray_id, adopter_id, detailsJson]
          );
          result = retryResult;
        } else {
          const [fallbackResult] = await pool.query(
            `INSERT INTO adoption_request (stray_id, adopter_id, status) 
             VALUES (?, ?, 'pending')`,
            [stray_id, adopter_id]
          );
          result = fallbackResult;
        }
      } else {
        throw e;
      }
    }

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

      // If this stray has an RFID (registered pet), transfer the pet record to the adopter
      // and delete any old-owner pet rows for the same RFID.
      try {
        const [rfidRows] = await connection.query(
          "SELECT rfid FROM stray_animals WHERE animal_id = ? FOR UPDATE",
          [ar.stray_id]
        );
        const strayRfid = String(rfidRows?.[0]?.rfid || "").trim();
        const adopterId = Number(ar.adopter_id);

        if (strayRfid && Number.isFinite(adopterId)) {
          const [petsByRfid] = await connection.query(
            "SELECT pet_id, owner_id FROM pet WHERE rfid = ? FOR UPDATE",
            [strayRfid]
          );

          if (petsByRfid?.length) {
            const ownerCounts = new Map();
            for (const row of petsByRfid) {
              const ownerId = Number(row.owner_id);
              if (!Number.isFinite(ownerId)) continue;
              ownerCounts.set(ownerId, (ownerCounts.get(ownerId) || 0) + 1);
            }

            const transferCandidate = petsByRfid.find((p) => {
              const ownerId = Number(p.owner_id);
              return Number.isFinite(ownerId) && ownerId !== adopterId;
            });

            if (transferCandidate) {
              const keepPetId = transferCandidate.pet_id;
              await connection.query(
                "UPDATE pet SET owner_id = ?, status = 'owned' WHERE pet_id = ?",
                [adopterId, keepPetId]
              );
              await connection.query(
                "DELETE FROM pet WHERE rfid = ? AND pet_id <> ?",
                [strayRfid, keepPetId]
              );

              // Best-effort: keep pet_count consistent
              try {
                const adopterExisting = ownerCounts.get(adopterId) || 0;
                const adopterDelta = 1 - adopterExisting;
                if (adopterDelta !== 0) {
                  await connection.query(
                    "UPDATE pet_owner SET pet_count = GREATEST(pet_count + ?, 0) WHERE owner_id = ?",
                    [adopterDelta, adopterId]
                  );
                }

                for (const [ownerId, count] of ownerCounts.entries()) {
                  if (ownerId === adopterId) continue;
                  if (!count) continue;
                  await connection.query(
                    "UPDATE pet_owner SET pet_count = GREATEST(pet_count - ?, 0) WHERE owner_id = ?",
                    [count, ownerId]
                  );
                }
              } catch (countErr) {
                logger.warn(
                  "Failed to update pet_count during approval ownership transfer",
                  countErr
                );
              }
            }
          }
        }
      } catch (transferErr) {
        // Do not block approval if transfer fails; claim endpoint still handles transfer.
        logger.warn("Ownership transfer on approval failed", transferErr);
      }

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

    // If the stray already has an RFID, it may already exist in `pet` (old owner).
    // On adoption, ownership should be transferred to the adopter and old pet records removed.
    const adopterId = Number(ar.adopter_id);
    const photo = normalizeStrayImagesToPhoto(ar.images);

    const [petsByRfid] = await connection.query(
      "SELECT pet_id, owner_id FROM pet WHERE rfid = ? FOR UPDATE",
      [finalRfid]
    );

    const ownerCounts = new Map();
    for (const row of petsByRfid || []) {
      const ownerId = Number(row.owner_id);
      if (!Number.isFinite(ownerId)) continue;
      ownerCounts.set(ownerId, (ownerCounts.get(ownerId) || 0) + 1);
    }

    const transferCandidate = (petsByRfid || []).find((p) => {
      const ownerId = Number(p.owner_id);
      return Number.isFinite(ownerId) && ownerId !== adopterId;
    });

    const updatePetFromStray = async (petId) => {
      await connection.query(
        `UPDATE pet
         SET name = COALESCE(?, name),
             species = COALESCE(?, species),
             breed = COALESCE(?, breed),
             sex = COALESCE(?, sex),
             color = COALESCE(?, color),
             markings = COALESCE(?, markings),
             photo = COALESCE(?, photo),
             status = COALESCE(status, 'owned')
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
    };

    const applyPetCountDeltasBestEffort = async () => {
      // Goal: ensure adopter ends up with exactly 1 pet record for this RFID.
      // For other owners, subtract their duplicates.
      try {
        const adopterExisting = ownerCounts.get(adopterId) || 0;
        const adopterDelta = 1 - adopterExisting;
        if (adopterDelta !== 0) {
          await connection.query(
            "UPDATE pet_owner SET pet_count = GREATEST(pet_count + ?, 0) WHERE owner_id = ?",
            [adopterDelta, adopterId]
          );
        }

        for (const [ownerId, count] of ownerCounts.entries()) {
          if (ownerId === adopterId) continue;
          if (!count) continue;
          await connection.query(
            "UPDATE pet_owner SET pet_count = GREATEST(pet_count - ?, 0) WHERE owner_id = ?",
            [count, ownerId]
          );
        }
      } catch (countErr) {
        logger.warn(
          "Failed to update pet_count during adoption transfer",
          countErr
        );
      }
    };

    let petId;
    if (transferCandidate) {
      // Transfer the existing pet record to the adopter
      petId = transferCandidate.pet_id;
      await connection.query(
        "UPDATE pet SET owner_id = ?, status = 'owned' WHERE pet_id = ?",
        [adopterId, petId]
      );

      // Remove any other pet rows that share this RFID (cleanup duplicates)
      await connection.query("DELETE FROM pet WHERE rfid = ? AND pet_id <> ?", [
        finalRfid,
        petId,
      ]);

      await updatePetFromStray(petId);
      await applyPetCountDeltasBestEffort();
    } else {
      // No old-owner pet exists. Keep a single adopter row if present; otherwise create one.
      const adopterPets = (petsByRfid || [])
        .filter((p) => Number(p.owner_id) === adopterId)
        .sort((a, b) => Number(a.pet_id) - Number(b.pet_id));

      if (adopterPets.length > 0) {
        petId = adopterPets[0].pet_id;
        await connection.query(
          "DELETE FROM pet WHERE rfid = ? AND pet_id <> ?",
          [finalRfid, petId]
        );
        await updatePetFromStray(petId);
        await applyPetCountDeltasBestEffort();
      } else {
        const [insertPet] = await connection.query(
          `INSERT INTO pet (owner_id, rfid, name, species, breed, age, sex, color, markings, photo, status)
           VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 'owned')`,
          [
            adopterId,
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
        try {
          await connection.query(
            "UPDATE pet_owner SET pet_count = pet_count + 1 WHERE owner_id = ?",
            [adopterId]
          );
        } catch (countErr) {
          logger.warn(
            "Failed to increment pet_count for adopter after claim",
            countErr
          );
        }
      }
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
