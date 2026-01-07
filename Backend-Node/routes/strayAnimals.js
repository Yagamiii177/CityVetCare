import express from "express";
import StrayAnimal from "../models/StrayAnimal.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("STRAY_ANIMAL_ROUTES");

const allowedStatuses = ["captured", "observation", "adoption"];

// GET /api/stray-animals
router.get("/", async (req, res) => {
  try {
    const animals = await StrayAnimal.list({
      status: req.query.status,
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
      species,
      breed,
      sex,
      marking,
      hasTag,
      tagNumber,
      captureDate,
      locationCaptured,
      notes,
      status,
      observationNotes,
      dateObserved,
      dateAddedToAdoption,
      images,
      pastObservations,
    } = req.body;

    if (!species || !sex || !captureDate || !locationCaptured) {
      return res.status(400).json({
        error: true,
        message: "species, sex, captureDate, and locationCaptured are required",
      });
    }

    const payload = {
      species,
      breed,
      sex,
      marking,
      hasTag: Boolean(hasTag),
      tagNumber,
      captureDate,
      locationCaptured,
      notes,
      status: status && allowedStatuses.includes(status) ? status : "captured",
      observationNotes,
      dateObserved,
      dateAddedToAdoption,
      images,
      pastObservations,
    };

    const created = await StrayAnimal.create(payload);
    res.status(201).json({ success: true, data: created });
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

    const updated = await StrayAnimal.update(req.params.id, req.body);
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

// PUT /api/stray-animals/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const {
      status,
      observationNotes,
      notes,
      dateObserved,
      dateAddedToAdoption,
    } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: true,
        message:
          "Invalid status. Allowed values: captured, observation, adoption",
      });
    }

    const updated = await StrayAnimal.updateStatus(req.params.id, {
      status,
      observationNotes,
      notes,
      dateObserved,
      dateAddedToAdoption,
    });

    if (!updated) {
      return res.status(404).json({
        error: true,
        message: "Stray animal not found",
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Failed to update stray animal status", error);
    res.status(500).json({
      error: true,
      message: "Unable to update status",
    });
  }
});

export default router;
