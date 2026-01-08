import express from "express";
import EuthanizedAnimal from "../models/EuthanizedAnimal.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("EUTHANIZED_ANIMAL_ROUTES");

// GET /api/euthanized-animals
router.get("/", async (req, res) => {
  try {
    const animals = await EuthanizedAnimal.list({
      species: req.query.species,
      hadOwner:
        req.query.hadOwner !== undefined
          ? req.query.hadOwner === "true"
          : undefined,
      search: req.query.search || req.query.q,
    });

    res.json({
      success: true,
      data: animals,
      total: animals.length,
    });
  } catch (error) {
    logger.error("Failed to list euthanized animals", error);
    res.status(500).json({
      error: true,
      message: "Unable to fetch euthanized animals",
    });
  }
});

// GET /api/euthanized-animals/:id
router.get("/:id", async (req, res) => {
  try {
    const animal = await EuthanizedAnimal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        error: true,
        message: "Euthanized animal record not found",
      });
    }

    res.json({ success: true, data: animal });
  } catch (error) {
    logger.error("Failed to fetch euthanized animal", error);
    res.status(500).json({
      error: true,
      message: "Unable to fetch euthanized animal",
    });
  }
});

export default router;
