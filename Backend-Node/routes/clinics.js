import express from "express";
import Clinic from "../models/Clinic.js";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const logger = new Logger("CLINIC_ROUTE");

const normalizeStatus = (status) => {
  if (!status) return undefined;
  const normalized = String(status).toLowerCase();

  // Allow requesting all statuses by skipping normalization
  if (normalized === "all") return null;

  const allowed = ["Active", "Pending", "Inactive", "Suspended"];
  const match = allowed.find((s) => s.toLowerCase() === normalized);
  return match || "Pending";
};

// GET /api/clinics
router.get("/", async (req, res) => {
  try {
    const filters = {
      status: normalizeStatus(req.query.status) || req.query.status,
      search: req.query.search || "",
    };
    const clinics = await Clinic.list(filters);
    res.json(clinics);
  } catch (error) {
    logger.error("Failed to list clinics", error);
    res.status(500).json({ error: true, message: "Failed to list clinics" });
  }
});

// GET /api/clinics/locations - clinics with coordinates for map (enhanced with filters)
router.get("/locations", async (req, res) => {
  try {
    const search = req.query.search || "";
    const status = normalizeStatus(req.query.status);
    const barangay = req.query.barangay || "";
    const service = req.query.service || "";

    let query = `SELECT * FROM private_clinic WHERE latitude IS NOT NULL AND longitude IS NOT NULL`;
    const params = [];

    // Status filter
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    // Search filter
    if (search) {
      query += ` AND (clinic_name LIKE ? OR address LIKE ? OR barangay LIKE ? OR email LIKE ? OR contact_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Barangay filter
    if (barangay) {
      query += ` AND barangay = ?`;
      params.push(barangay);
    }

    // Service filter
    if (service) {
      query += ` AND JSON_CONTAINS(services, JSON_QUOTE(?))`;
      params.push(service);
    }

    query += ` ORDER BY date_created DESC, clinic_id DESC`;

    const [rows] = await pool.query(query, params);

    const markers = rows.map((row) => ({
      id: row.clinic_id,
      name: row.clinic_name,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      status: row.status,
      barangay: row.barangay,
      address: row.address,
      phone: row.contact_number,
      veterinarian: row.head_veterinarian,
      services: row.services ? JSON.parse(row.services) : [],
      workingHours: row.operating_hours
        ? JSON.parse(row.operating_hours)
        : null,
    }));

    res.json(markers);
  } catch (error) {
    logger.error("Failed to list clinic locations", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to list clinic locations" });
  }
});

// GET /api/clinics/map/status-counts - status counts for clinics with coordinates
router.get("/map/status-counts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) as count FROM private_clinic WHERE latitude IS NOT NULL AND longitude IS NOT NULL GROUP BY status`
    );

    const counts = {
      all: 0,
      Active: 0,
      Pending: 0,
      Inactive: 0,
      Suspended: 0,
    };

    rows.forEach((row) => {
      if (counts[row.status] !== undefined) {
        counts[row.status] = row.count;
      }
    });

    counts.all = Object.values(counts).reduce((sum, val) => sum + val, 0);

    res.json(counts);
  } catch (error) {
    logger.error("Failed to get clinic status counts", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to get status counts" });
  }
});

// GET /api/clinics/:id
router.get("/:id", async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ error: true, message: "Clinic not found" });
    }
    res.json(clinic);
  } catch (error) {
    logger.error("Failed to fetch clinic", error);
    res.status(500).json({ error: true, message: "Failed to fetch clinic" });
  }
});

// POST /api/clinics
router.post("/", async (req, res) => {
  try {
    const {
      name,
      veterinarian,
      licenseNumber,
      email,
      phone,
      address,
      barangay,
      latitude,
      longitude,
      services = [],
      workingHours,
      status,
    } = req.body;

    if (
      !name ||
      !veterinarian ||
      !licenseNumber ||
      !email ||
      !phone ||
      !address
    ) {
      return res
        .status(400)
        .json({ error: true, message: "Missing required clinic fields" });
    }

    const clinic = await Clinic.create({
      name,
      veterinarian,
      licenseNumber,
      email,
      phone,
      address,
      barangay,
      latitude,
      longitude,
      services,
      operatingHours: workingHours,
      status: normalizeStatus(status),
    });

    res.status(201).json(clinic);
  } catch (error) {
    logger.error("Failed to create clinic", error);
    res.status(500).json({ error: true, message: "Failed to create clinic" });
  }
});

// PUT /api/clinics/:id
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      veterinarian,
      licenseNumber,
      email,
      phone,
      address,
      barangay,
      latitude,
      longitude,
      services,
      workingHours,
      status,
    } = req.body;

    const clinic = await Clinic.update(req.params.id, {
      name,
      veterinarian,
      licenseNumber,
      email,
      phone,
      address,
      barangay,
      latitude,
      longitude,
      services,
      operatingHours: workingHours,
      status: normalizeStatus(status),
    });

    if (!clinic) {
      return res.status(404).json({ error: true, message: "Clinic not found" });
    }

    res.json(clinic);
  } catch (error) {
    logger.error("Failed to update clinic", error);
    res.status(500).json({ error: true, message: "Failed to update clinic" });
  }
});

// PATCH /api/clinics/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ error: true, message: "Status is required" });
    }

    const normalizedStatus = normalizeStatus(status);
    const clinic = await Clinic.updateStatus(req.params.id, normalizedStatus);

    if (!clinic) {
      return res.status(404).json({ error: true, message: "Clinic not found" });
    }

    res.json(clinic);
  } catch (error) {
    logger.error("Failed to update clinic status", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to update clinic status" });
  }
});

// PATCH /api/clinics/:id/approve
router.patch("/:id/approve", async (req, res) => {
  try {
    const clinic = await Clinic.updateStatus(req.params.id, "Active");

    if (!clinic) {
      return res.status(404).json({ error: true, message: "Clinic not found" });
    }

    res.json(clinic);
  } catch (error) {
    logger.error("Failed to approve clinic", error);
    res.status(500).json({ error: true, message: "Failed to approve clinic" });
  }
});

export default router;
