import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const logger = new Logger("CLINIC_MODEL");

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
  id: row.clinic_id,
  name: row.clinic_name,
  veterinarian: row.head_veterinarian,
  licenseNumber: row.license_number,
  email: row.email,
  phone: row.contact_number,
  address: row.address,
  barangay: row.barangay,
  latitude: row.latitude ? parseFloat(row.latitude) : null,
  longitude: row.longitude ? parseFloat(row.longitude) : null,
  services: row.services ? JSON.parse(row.services) : [],
  operatingHours: row.operating_hours ? JSON.parse(row.operating_hours) : null,
  status: row.status,
  permitExpiryDate: formatDate(row.permit_expiry_date),
  accreditationExpiryDate: formatDate(row.accreditation_expiry_date),
  lastInspectionDate: formatDate(row.last_inspection_date),
  inspectionStatus: row.inspection_status,
  inspectionNotes: row.inspection_notes,
  lastActivityDate: row.last_activity_date,
  registrationDate: formatDate(row.date_created),
  lastUpdated: formatDate(row.date_updated),
  dateCreated: row.date_created,
  dateUpdated: row.date_updated,
});

class Clinic {
  static async list(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status && filters.status !== "all") {
      conditions.push("status = ?");
      params.push(filters.status);
    }

    if (filters.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        "(LOWER(clinic_name) LIKE ? OR LOWER(email) LIKE ? OR contact_number LIKE ? OR LOWER(head_veterinarian) LIKE ? OR LOWER(license_number) LIKE ? OR LOWER(barangay) LIKE ?)"
      );
      params.push(term, term, term, term, term, term);
    }

    if (filters.barangay) {
      conditions.push("barangay = ?");
      params.push(filters.barangay);
    }

    if (filters.service) {
      conditions.push("JSON_CONTAINS(services, JSON_QUOTE(?))");
      params.push(filters.service);
    }

    if (filters.inspectionStatus) {
      conditions.push("inspection_status = ?");
      params.push(filters.inspectionStatus);
    }

    let query = "SELECT * FROM private_clinic";
    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY date_created DESC, clinic_id DESC";

    try {
      const [rows] = await pool.query(query, params);
      return rows.map(mapRow);
    } catch (error) {
      logger.error("Error listing clinics", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM private_clinic WHERE clinic_id = ?",
        [id]
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch (error) {
      logger.error("Error finding clinic by id", error);
      throw error;
    }
  }

  static async create(data) {
    const payload = {
      clinic_name: data.name,
      head_veterinarian: data.veterinarian,
      license_number: data.licenseNumber,
      email: data.email,
      contact_number: data.phone,
      address: data.address,
      barangay: data.barangay || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      services: data.services ? JSON.stringify(data.services) : null,
      operating_hours: data.operatingHours
        ? JSON.stringify(data.operatingHours)
        : null,
      status: data.status || "Pending",
      permit_expiry_date: data.permitExpiryDate || null,
      accreditation_expiry_date: data.accreditationExpiryDate || null,
      inspection_status: data.inspectionStatus || "Pending",
    };

    try {
      const [result] = await pool.query(
        `INSERT INTO private_clinic (
          clinic_name, head_veterinarian, license_number, email, contact_number, address, barangay, latitude, longitude, services, operating_hours, status, permit_expiry_date, accreditation_expiry_date, inspection_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `.replace(/\n\s+/g, " "),
        [
          payload.clinic_name,
          payload.head_veterinarian,
          payload.license_number,
          payload.email,
          payload.contact_number,
          payload.address,
          payload.barangay,
          payload.latitude,
          payload.longitude,
          payload.services,
          payload.operating_hours,
          payload.status,
          payload.permit_expiry_date,
          payload.accreditation_expiry_date,
          payload.inspection_status,
        ]
      );

      return this.findById(result.insertId);
    } catch (error) {
      logger.error("Error creating clinic", error);
      throw error;
    }
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    const fieldMap = {
      clinic_name: data.name,
      head_veterinarian: data.veterinarian,
      license_number: data.licenseNumber,
      email: data.email,
      contact_number: data.phone,
      address: data.address,
      barangay: data.barangay,
      latitude: data.latitude,
      longitude: data.longitude,
      services: data.services ? JSON.stringify(data.services) : undefined,
      operating_hours: data.operatingHours
        ? JSON.stringify(data.operatingHours)
        : undefined,
      status: data.status,
      permit_expiry_date: data.permitExpiryDate,
      accreditation_expiry_date: data.accreditationExpiryDate,
      last_inspection_date: data.lastInspectionDate,
      inspection_status: data.inspectionStatus,
      inspection_notes: data.inspectionNotes,
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
    const query = `UPDATE private_clinic SET ${updates.join(
      ", "
    )}, date_updated = CURRENT_TIMESTAMP WHERE clinic_id = ?`;

    try {
      await pool.query(query, params);
      return this.findById(id);
    } catch (error) {
      logger.error("Error updating clinic", error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      await pool.query(
        "UPDATE private_clinic SET status = ?, date_updated = CURRENT_TIMESTAMP WHERE clinic_id = ?",
        [status, id]
      );
      return this.findById(id);
    } catch (error) {
      logger.error("Error updating clinic status", error);
      throw error;
    }
  }
}

export default Clinic;
