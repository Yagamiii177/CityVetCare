import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const logger = new Logger("STRAY_ANIMAL_MODEL");

const formatDate = (value) => {
  if (!value) return null;
  try {
    // mysql2 returns Date objects by default; string fallback for safety
    return typeof value === "string"
      ? value.slice(0, 10)
      : value.toISOString().split("T")[0];
  } catch (error) {
    return null;
  }
};

const mapRow = (row) => ({
  id: row.animal_id,
  rfid: row.rfid,
  name: row.name,
  species: row.species,
  breed: row.breed,
  sex: row.sex,
  color: row.color,
  markings: row.markings,
  sprayedNeutered: Boolean(row.sprayed_neutered),
  capturedBy: row.captured_by,
  dateCaptured: formatDate(row.date_captured),
  registrationDate: formatDate(row.registration_date),
  locationCaptured: row.location_captured,
  images: row.images ? JSON.parse(row.images) : {},
  status: row.status || "captured",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

class StrayAnimal {
  static async list(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.species) {
      conditions.push("species = ?");
      params.push(filters.species);
    }

    if (filters.breed) {
      conditions.push("breed = ?");
      params.push(filters.breed);
    }

    if (filters.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        "(LOWER(breed) LIKE ? OR LOWER(location_captured) LIKE ? OR LOWER(rfid) LIKE ?)"
      );
      params.push(term, term, term);
    }

    if (filters.observationStatus) {
      // Backward compatibility: map observationStatus to status filter
      conditions.push("status = ?");
      params.push(filters.observationStatus);
    }

    if (filters.status) {
      conditions.push("status = ?");
      params.push(filters.status);
    }

    let query = "SELECT * FROM stray_animals";
    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY date_captured DESC, animal_id DESC";

    try {
      const [rows] = await pool.query(query, params);
      return rows.map(mapRow);
    } catch (error) {
      logger.error("Error listing stray animals", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM stray_animals WHERE animal_id = ?",
        [id]
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch (error) {
      logger.error("Error finding stray animal by id", error);
      throw error;
    }
  }

  static async findByRfid(rfid) {
    if (!rfid) return null;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM stray_animals WHERE rfid = ? ORDER BY updated_at DESC LIMIT 1",
        [rfid]
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch (error) {
      logger.error("Error finding stray animal by RFID", error);
      throw error;
    }
  }

  static async create(data) {
    const payload = {
      rfid: data.rfid || null,
      name: data.name || null,
      species: data.species,
      breed: data.breed || null,
      sex: data.sex || "Unknown",
      color: data.color || null,
      markings: data.markings || null,
      sprayedNeutered: data.sprayedNeutered ? 1 : 0,
      capturedBy: data.capturedBy || null,
      dateCaptured: data.dateCaptured,
      registrationDate: data.registrationDate || formatDate(new Date()),
      locationCaptured: data.locationCaptured,
      images: data.images ? JSON.stringify(data.images) : null,
      status: data.status || "captured",
    };

    try {
      const [result] = await pool.query(
        `INSERT INTO stray_animals (
          rfid, name, species, breed, sex, color, markings, sprayed_neutered, 
          captured_by, date_captured, registration_date, location_captured, images,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`.replace(
          /\n\s+/g,
          " "
        ),
        [
          payload.rfid,
          payload.name,
          payload.species,
          payload.breed,
          payload.sex,
          payload.color,
          payload.markings,
          payload.sprayedNeutered,
          payload.capturedBy,
          payload.dateCaptured,
          payload.registrationDate,
          payload.locationCaptured,
          payload.images,
          payload.status,
        ]
      );

      return this.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating stray animal", error);
      throw error;
    }
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    const fieldMap = {
      rfid: data.rfid,
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      color: data.color,
      markings: data.markings,
      sprayed_neutered:
        data.sprayedNeutered !== undefined
          ? data.sprayedNeutered
            ? 1
            : 0
          : undefined,
      captured_by: data.capturedBy,
      date_captured: data.dateCaptured,
      registration_date: data.registrationDate,
      location_captured: data.locationCaptured,
      images: data.images ? JSON.stringify(data.images) : undefined,
      status: data.status,
    };

    Object.entries(fieldMap).forEach(([column, value]) => {
      if (value !== undefined) {
        updates.push(`${column} = ?`);
        params.push(value);
      }
    });

    if (!updates.length) {
      return this.findById(id);
    }

    params.push(id);
    const query = `UPDATE stray_animals SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE animal_id = ?`;

    try {
      await pool.query(query, params);
      return this.findById(id);
    } catch (error) {
      logger.error("Error updating stray animal", error);
      throw error;
    }
  }
}

export default StrayAnimal;
