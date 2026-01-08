import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const logger = new Logger("PET_OWNER_MODEL");

class PetOwner {
  static _columns = null;

  static async getColumns() {
    try {
      if (PetOwner._columns) return PetOwner._columns;
      const [rows] = await pool.query("SHOW COLUMNS FROM pet_owner");
      PetOwner._columns = new Set(rows.map((r) => r.Field));
      return PetOwner._columns;
    } catch (error) {
      logger.error("Error reading pet_owner columns", error);
      // Fall back to base columns only.
      PetOwner._columns = new Set([
        "owner_id",
        "full_name",
        "email",
        "password",
        "contact_number",
        "address",
        "date_registered",
        "date_updated",
      ]);
      return PetOwner._columns;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM pet_owner WHERE email = ?",
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error("Error finding pet owner by email", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const columns = await PetOwner.getColumns();
      const base = [
        "owner_id",
        "full_name",
        "email",
        "contact_number",
        "address",
        "date_registered",
      ];
      if (columns.has("birthdate")) base.push("birthdate");
      if (columns.has("home_latitude")) base.push("home_latitude");
      if (columns.has("home_longitude")) base.push("home_longitude");

      const [rows] = await pool.query(
        `SELECT ${base.join(", ")} FROM pet_owner WHERE owner_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error("Error finding pet owner by id", error);
      throw error;
    }
  }

  static async create(
    fullName,
    email,
    password,
    contactNumber,
    address,
    birthdate = null,
    homeLatitude = null,
    homeLongitude = null
  ) {
    try {
      const columns = await PetOwner.getColumns();

      const insertCols = [
        "full_name",
        "email",
        "password",
        "contact_number",
        "address",
      ];
      const insertVals = [fullName, email, password, contactNumber, address];

      if (columns.has("birthdate")) {
        insertCols.push("birthdate");
        insertVals.push(birthdate);
      }

      if (columns.has("home_latitude")) {
        insertCols.push("home_latitude");
        insertVals.push(homeLatitude);
      }

      if (columns.has("home_longitude")) {
        insertCols.push("home_longitude");
        insertVals.push(homeLongitude);
      }

      const placeholders = insertCols.map(() => "?").join(", ");
      const [result] = await pool.query(
        `INSERT INTO pet_owner (${insertCols.join(
          ", "
        )}) VALUES (${placeholders})`,
        insertVals
      );
      return result;
    } catch (error) {
      logger.error("Error creating pet owner", error);
      throw error;
    }
  }

  static async update(id, fullName, contactNumber, address) {
    try {
      const [result] = await pool.query(
        "UPDATE pet_owner SET full_name = ?, contact_number = ?, address = ?, date_updated = CURRENT_TIMESTAMP WHERE owner_id = ?",
        [fullName, contactNumber, address, id]
      );
      return result;
    } catch (error) {
      logger.error("Error updating pet owner", error);
      throw error;
    }
  }

  static async updatePassword(id, hashedPassword) {
    try {
      const [result] = await pool.query(
        "UPDATE pet_owner SET password = ?, date_updated = CURRENT_TIMESTAMP WHERE owner_id = ?",
        [hashedPassword, id]
      );
      return result;
    } catch (error) {
      logger.error("Error updating pet owner password", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query(
        "DELETE FROM pet_owner WHERE owner_id = ?",
        [id]
      );
      return result;
    } catch (error) {
      logger.error("Error deleting pet owner", error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const columns = await PetOwner.getColumns();
      const base = [
        "owner_id",
        "full_name",
        "email",
        "contact_number",
        "address",
        "date_registered",
      ];
      if (columns.has("birthdate")) base.push("birthdate");
      if (columns.has("home_latitude")) base.push("home_latitude");
      if (columns.has("home_longitude")) base.push("home_longitude");

      const [rows] = await pool.query(
        `SELECT ${base.join(", ")} FROM pet_owner`
      );
      return rows;
    } catch (error) {
      logger.error("Error getting all pet owners", error);
      throw error;
    }
  }

  static async count() {
    try {
      const [rows] = await pool.query(
        "SELECT COUNT(*) as count FROM pet_owner"
      );
      return rows[0].count;
    } catch (error) {
      logger.error("Error counting pet owners", error);
      throw error;
    }
  }
}

export default PetOwner;
