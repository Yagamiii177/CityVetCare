/**
 * Pet Routes
 * Handles pet-related API endpoints
 */

import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { pool } from "../config/database.js";

const router = express.Router();

/**
 * GET /api/pets/rfid/:rfid
 * Fetch pet data by RFID and return pet owner information
 */
router.get("/rfid/:rfid", authenticateToken, async (req, res) => {
  try {
    const { rfid } = req.params;

    // Validate RFID format (9 digits)
    if (!/^\d{9}$/.test(rfid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid RFID format. Must be exactly 9 digits.",
      });
    }

    // Query to get pet and owner information
    const query = `
      SELECT 
        p.pet_id,
        p.owner_id,
        p.rfid,
        p.name,
        p.species,
        p.breed,
        p.age,
        p.sex,
        p.color,
        p.markings,
        p.photo,
        p.status,
        p.capture_count,
        p.redemption_count,
        po.owner_id,
        po.full_name,
        po.address,
        po.contact_number,
        po.email
      FROM pet p
      LEFT JOIN pet_owner po ON p.owner_id = po.owner_id
      WHERE p.rfid = ?
    `;

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, [rfid]);
    connection.release();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pet not found with this RFID.",
      });
    }

    const row = rows[0];

    return res.json({
      success: true,
      pet: {
        pet_id: row.pet_id,
        rfid: row.rfid,
        name: row.name,
        species: row.species,
        breed: row.breed,
        age: row.age,
        sex: row.sex,
        color: row.color,
        markings: row.markings,
        photo: row.photo,
        status: row.status,
        capture_count: row.capture_count,
        redemption_count: row.redemption_count,
      },
      owner: {
        owner_id: row.owner_id,
        full_name: row.full_name,
        address: row.address,
        contact_number: row.contact_number,
        email: row.email,
      },
    });
  } catch (error) {
    console.error("Error fetching pet by RFID:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching pet data",
      error: error.message,
    });
  }
});

/**
 * POST /api/pets
 * Register a pet (matches `pet` table)
 * Body: { owner_id, rfid?, name, species, breed?, age?, sex?, color?, markings?, photo, status? }
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      owner_id,
      rfid,
      name,
      species,
      breed,
      age,
      sex,
      color,
      markings,
      photo,
      status,
    } = req.body || {};

    if (!owner_id || Number.isNaN(Number(owner_id))) {
      return res.status(400).json({
        success: false,
        message: "owner_id is required and must be a number.",
      });
    }

    if (!name || String(name).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "name is required.",
      });
    }

    if (!species || String(species).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "species is required.",
      });
    }

    if (rfid && !/^\d{9}$/.test(String(rfid).trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid RFID format. Must be exactly 9 digits.",
      });
    }

    if (!photo || String(photo).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "photo is required.",
      });
    }

    const ageValue =
      age === null || age === undefined || String(age).trim?.() === ""
        ? null
        : Number(age);

    if (ageValue !== null && (Number.isNaN(ageValue) || ageValue < 0)) {
      return res.status(400).json({
        success: false,
        message: "age must be a non-negative number.",
      });
    }

    const insertQuery = `
      INSERT INTO pet
        (owner_id, rfid, name, species, breed, age, sex, color, markings, photo, status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(insertQuery, [
      Number(owner_id),
      rfid ? String(rfid).trim() : null,
      String(name).trim(),
      String(species).trim(),
      breed ? String(breed).trim() : null,
      ageValue,
      sex ? String(sex).trim() : null,
      color ? String(color).trim() : null,
      markings ? String(markings).trim() : null,
      String(photo).trim(),
      status ? String(status).trim() : "active",
    ]);
    connection.release();

    return res.status(201).json({
      success: true,
      message: "Pet registered successfully.",
      pet: {
        pet_id: result.insertId,
        owner_id: Number(owner_id),
        rfid: rfid ? String(rfid).trim() : null,
        name: String(name).trim(),
        species: String(species).trim(),
        breed: breed ? String(breed).trim() : null,
        age: ageValue,
        sex: sex ? String(sex).trim() : null,
        color: color ? String(color).trim() : null,
        markings: markings ? String(markings).trim() : null,
        photo: String(photo).trim(),
        status: status ? String(status).trim() : "active",
      },
    });
  } catch (error) {
    console.error("Error registering pet:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering pet",
      error: error.message,
    });
  }
});

export default router;
