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
  species: row.species,
  breed: row.breed,
  sex: row.sex,
  marking: row.marking,
  hasTag: Boolean(row.has_tag),
  tagNumber: row.tag_number,
  captureDate: formatDate(row.capture_date),
  locationCaptured: row.location_captured,
  notes: row.notes,
  observationNotes: row.observation_notes,
  status: row.status,
  dateObserved: formatDate(row.date_observed),
  dateAddedToAdoption: formatDate(row.date_added_to_adoption),
  images: row.images ? JSON.parse(row.images) : {},
  pastObservations: row.past_observations
    ? JSON.parse(row.past_observations)
    : [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

class StrayAnimal {
  static async list(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push("status = ?");
      params.push(filters.status);
    }

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
        "(LOWER(breed) LIKE ? OR LOWER(location_captured) LIKE ? OR tag_number LIKE ?)"
      );
      params.push(term, term, term);
    }

    if (filters.observationStatus) {
      conditions.push("LOWER(observation_notes) LIKE ?");
      params.push(`%${filters.observationStatus.toLowerCase()}%`);
    }

    let query = "SELECT * FROM stray_animals";
    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY capture_date DESC, animal_id DESC";

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

  static async create(data) {
    const payload = {
      species: data.species,
      breed: data.breed || null,
      sex: data.sex || "Unknown",
      marking: data.marking || null,
      hasTag: data.hasTag ? 1 : 0,
      tagNumber: data.tagNumber || null,
      captureDate: data.captureDate,
      locationCaptured: data.locationCaptured,
      notes: data.notes || null,
      observationNotes: data.observationNotes || null,
      status: data.status || "captured",
      dateObserved: data.dateObserved || null,
      dateAddedToAdoption: data.dateAddedToAdoption || null,
      images: data.images ? JSON.stringify(data.images) : null,
      pastObservations: data.pastObservations
        ? JSON.stringify(data.pastObservations)
        : null,
    };

    try {
      const [result] = await pool.query(
        `INSERT INTO stray_animals (
          species, breed, sex, marking, has_tag, tag_number, capture_date, location_captured,
          notes, observation_notes, status, date_observed, date_added_to_adoption, images, past_observations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`.replace(
          /\n\s+/g,
          " "
        ),
        [
          payload.species,
          payload.breed,
          payload.sex,
          payload.marking,
          payload.hasTag,
          payload.tagNumber,
          payload.captureDate,
          payload.locationCaptured,
          payload.notes,
          payload.observationNotes,
          payload.status,
          payload.dateObserved,
          payload.dateAddedToAdoption,
          payload.images,
          payload.pastObservations,
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
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      marking: data.marking,
      has_tag: data.hasTag !== undefined ? (data.hasTag ? 1 : 0) : undefined,
      tag_number: data.tagNumber,
      capture_date: data.captureDate,
      location_captured: data.locationCaptured,
      notes: data.notes,
      observation_notes: data.observationNotes,
      status: data.status,
      date_observed: data.dateObserved,
      date_added_to_adoption: data.dateAddedToAdoption,
      images: data.images ? JSON.stringify(data.images) : undefined,
      past_observations: data.pastObservations
        ? JSON.stringify(data.pastObservations)
        : undefined,
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

  static async updateStatus(id, statusPayload) {
    const payload = { status: statusPayload.status };

    if (statusPayload.status === "observation") {
      payload.observationNotes = statusPayload.observationNotes || null;
      payload.dateObserved =
        statusPayload.dateObserved || formatDate(new Date());
    }

    if (statusPayload.status === "captured") {
      payload.notes = statusPayload.notes || null;
      payload.observationNotes = statusPayload.observationNotes || null;
    }

    if (statusPayload.status === "adoption") {
      payload.dateAddedToAdoption =
        statusPayload.dateAddedToAdoption || formatDate(new Date());
    }

    return this.update(id, payload);
  }
}

export default StrayAnimal;
