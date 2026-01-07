import express from "express";
import StrayAnimal from "../models/StrayAnimal.js";
import EuthanizedAnimal from "../models/EuthanizedAnimal.js";
import Logger from "../utils/logger.js";
import { pool } from "../config/database.js";
import { sendOwnerAlert } from "../services/notificationService.js";

const router = express.Router();
const logger = new Logger("STRAY_ANIMAL_ROUTES");

// Accept only web-accessible image references; drop device-local file:// URIs
const isAllowedImage = (val = "") => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("file:")) return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/uploads") ||
    trimmed.startsWith("uploads/")
  );
};

const normalizeImages = (images) => {
  if (!images) return null;

  const toEntries = () => {
    if (Array.isArray(images)) return images.map((v, idx) => [idx, v]);
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed.map((v, idx) => [idx, v]);
        if (parsed && typeof parsed === "object") return Object.entries(parsed);
        return [["0", images]];
      } catch (e) {
        return [["0", images]];
      }
    }
    if (typeof images === "object") return Object.entries(images);
    return [];
  };

  const filtered = toEntries()
    .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    .filter(([, v]) => isAllowedImage(v));

  if (!filtered.length) return null;

  // Preserve keys where possible
  return Object.fromEntries(filtered);
};

// Status and counters handled in model

// GET /api/stray-animals
router.get("/", async (req, res) => {
  try {
    const animals = await StrayAnimal.list({
      species: req.query.species,
      breed: req.query.breed,
      search: req.query.search || req.query.q,
      observationStatus: req.query.observationStatus,
    });

    res.json({
      success: true,
      data: animals,
      total: animals.length,
    });
  } catch (error) {
    logger.error("Failed to list stray animals", error);
    res.status(500).json({
      error: true,
      message: "Unable to fetch stray animals",
    });
  }
});

// GET /api/stray-animals/:id
router.get("/:id", async (req, res) => {
  try {
    const animal = await StrayAnimal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    res.json({ success: true, data: animal });
  } catch (error) {
    logger.error("Failed to fetch stray animal", error);
    res.status(500).json({
      error: true,
      message: "Unable to fetch stray animal",
    });
  }
});

// POST /api/stray-animals
router.post("/", async (req, res) => {
  try {
    const {
      rfid,
      name,
      species,
      breed,
      sex,
      color,
      markings,
      sprayedNeutered,
      capturedBy,
      dateCaptured,
      registrationDate,
      locationCaptured,
      notes,
      images,
    } = req.body;

    if (!species || !sex || !dateCaptured || !locationCaptured) {
      return res.status(400).json({
        error: true,
        message:
          "species, sex, dateCaptured, and locationCaptured are required",
      });
    }

    const normalizedRfid = rfid ? rfid.trim() : null;
    const existing = normalizedRfid
      ? await StrayAnimal.findByRfid(normalizedRfid)
      : null;

    let petRecord = null;
    if (normalizedRfid) {
      const [petRows] = await pool.query(
        "SELECT pet_id, capture_count, redemption_count FROM pet WHERE rfid = ?",
        [normalizedRfid]
      );
      petRecord = petRows[0] || null;
    }

    const payload = {
      rfid: normalizedRfid,
      name,
      species,
      breed,
      sex,
      color,
      markings,
      sprayedNeutered: Boolean(sprayedNeutered),
      capturedBy,
      dateCaptured,
      registrationDate:
        registrationDate || new Date().toISOString().split("T")[0],
      locationCaptured,
      notes,
      images: normalizeImages(images),
    };

    let result;

    if (existing) {
      // Update status for known RFID
      const updated = await StrayAnimal.update(existing.id, {
        ...payload,
        status: "captured",
      });
      result = updated;
    } else {
      result = await StrayAnimal.create({
        ...payload,
        status: "captured",
      });
    }

    if (petRecord) {
      const newCaptureCount = (petRecord.capture_count || 0) + 1;
      await pool.query(
        "UPDATE pet SET capture_count = ?, date_updated = CURRENT_TIMESTAMP WHERE pet_id = ?",
        [newCaptureCount, petRecord.pet_id]
      );
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error("Failed to create stray animal", error);
    res.status(500).json({
      error: true,
      message: "Unable to create stray animal",
    });
  }
});

// PUT /api/stray-animals/:id
router.put("/:id", async (req, res) => {
  try {
    if (!Object.keys(req.body || {}).length) {
      return res.status(400).json({
        error: true,
        message: "No fields provided for update",
      });
    }

    const updated = await StrayAnimal.update(req.params.id, {
      ...req.body,
      images: normalizeImages(req.body?.images),
    });
    if (!updated) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Failed to update stray animal", error);
    res.status(500).json({
      error: true,
      message: "Unable to update stray animal",
    });
  }
});

// Status-specific route removed since schema no longer includes status

// POST /api/stray-animals/:id/adopt
// Move animal to adoption list (change status to 'adoption')
router.post("/:id/adopt", async (req, res) => {
  try {
    const animal = await StrayAnimal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    const updated = await StrayAnimal.update(req.params.id, {
      status: "adoption",
    });

    res.json({
      success: true,
      message: "Animal moved to adoption list",
      data: updated,
    });
  } catch (error) {
    logger.error("Failed to move animal to adoption", error);
    res.status(500).json({
      error: true,
      message: "Unable to move animal to adoption list",
    });
  }
});

// POST /api/stray-animals/:id/euthanize
// Move animal to euthanized table
router.post("/:id/euthanize", async (req, res) => {
  try {
    const { reason, performedBy } = req.body;
    const animal = await StrayAnimal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    // Check if animal has an owner (RFID exists)
    let ownerId = null;
    let hadOwner = false;
    if (animal.rfid) {
      const [petRows] = await pool.query(
        "SELECT owner_id FROM pet WHERE rfid = ?",
        [animal.rfid]
      );
      if (petRows.length > 0) {
        ownerId = petRows[0].owner_id;
        hadOwner = true;
      }
    }

    // Create euthanized record
    const euthanizedRecord = await EuthanizedAnimal.create({
      originalAnimalId: animal.id,
      rfid: animal.rfid,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      sex: animal.sex,
      color: animal.color,
      markings: animal.markings,
      sprayedNeutered: animal.sprayedNeutered,
      capturedBy: animal.capturedBy,
      dateCaptured: animal.dateCaptured,
      locationCaptured: animal.locationCaptured,
      reason,
      performedBy,
      images: animal.images,
      hadOwner,
      ownerId,
    });

    // Delete from stray_animals table
    await pool.query("DELETE FROM stray_animals WHERE animal_id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Animal moved to euthanized list",
      data: euthanizedRecord,
    });
  } catch (error) {
    logger.error("Failed to euthanize animal", error);
    res.status(500).json({
      error: true,
      message: "Unable to euthanize animal",
    });
  }
});

// POST /api/stray-animals/:id/alert-owner
// Send alert to pet owner about captured animal
router.post("/:id/alert-owner", async (req, res) => {
  try {
    const animal = await StrayAnimal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    if (!animal.rfid) {
      return res.status(400).json({
        error: true,
        message: "Cannot alert owner: animal has no RFID",
      });
    }

    // Get pet and owner information
    const [petRows] = await pool.query(
      `SELECT p.pet_id, p.name as pet_name, p.owner_id, 
              o.full_name, o.email, o.contact_number
       FROM pet p
       JOIN pet_owner o ON p.owner_id = o.owner_id
       WHERE p.rfid = ?`,
      [animal.rfid]
    );

    if (petRows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "No owner found for this RFID",
      });
    }

    const ownerData = petRows[0];

    // Send notifications
    const notificationResult = await sendOwnerAlert({
      ownerName: ownerData.full_name,
      email: ownerData.email,
      contactNumber: ownerData.contact_number,
      petName: ownerData.pet_name,
      captureLocation: animal.locationCaptured,
      captureDate: animal.dateCaptured,
      ownerId: ownerData.owner_id,
    });

    res.json({
      success: true,
      message: "Owner alert sent successfully",
      notifications: notificationResult,
    });
  } catch (error) {
    logger.error("Failed to alert owner", error);
    res.status(500).json({
      error: true,
      message: "Unable to send owner alert",
    });
  }
});

export default router;
