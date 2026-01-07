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
        p.photo,
        p.status,
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
        photo: row.photo,
        status: row.status,
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

export default router;
