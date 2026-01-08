import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const logger = new Logger("EUTHANIZED_ANIMAL_MODEL");

const formatDate = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string"
      ? value.slice(0, 10)
      : value.toISOString().split("T")[0];
  } catch (error) {
    return null;
  }
};

const mapRow = (row) => ({
  id: row.euthanized_id,
  originalAnimalId: row.original_animal_id,
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
  dateEuthanized: row.date_euthanized,
  locationCaptured: row.location_captured,
  reason: row.reason,
  performedBy: row.performed_by,
  images: row.images ? JSON.parse(row.images) : {},
  hadOwner: Boolean(row.had_owner),
  ownerId: row.owner_id,
  createdAt: row.created_at,
});

class EuthanizedAnimal {
  static async list(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.species) {
      conditions.push("species = ?");
      params.push(filters.species);
    }

    if (filters.hadOwner !== undefined) {
      conditions.push("had_owner = ?");
      params.push(filters.hadOwner ? 1 : 0);
    }

    if (filters.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        "(LOWER(breed) LIKE ? OR LOWER(location_captured) LIKE ? OR LOWER(rfid) LIKE ?)"
      );
      params.push(term, term, term);
    }

    let query = "SELECT * FROM euthanized_animals";
    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY date_euthanized DESC";

    try {
      const [rows] = await pool.query(query, params);
      return rows.map(mapRow);
    } catch (error) {
      logger.error("Error listing euthanized animals", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM euthanized_animals WHERE euthanized_id = ?",
        [id]
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch (error) {
      logger.error("Error finding euthanized animal by id", error);
      throw error;
    }
  }

  static async create(data) {
    const payload = {
      originalAnimalId: data.originalAnimalId,
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
      locationCaptured: data.locationCaptured,
      reason: data.reason || null,
      performedBy: data.performedBy || null,
      images: data.images ? JSON.stringify(data.images) : null,
      hadOwner: data.hadOwner ? 1 : 0,
      ownerId: data.ownerId || null,
    };

    try {
      const [result] = await pool.query(
        `INSERT INTO euthanized_animals (
          original_animal_id, rfid, name, species, breed, sex, color, markings, 
          sprayed_neutered, captured_by, date_captured, location_captured, 
          reason, performed_by, images, had_owner, owner_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`.replace(
          /\n\s+/g,
          " "
        ),
        [
          payload.originalAnimalId,
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
          payload.locationCaptured,
          payload.reason,
          payload.performedBy,
          payload.images,
          payload.hadOwner,
          payload.ownerId,
        ]
      );

      return this.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating euthanized animal record", error);
      throw error;
    }
  }
}

export default EuthanizedAnimal;
