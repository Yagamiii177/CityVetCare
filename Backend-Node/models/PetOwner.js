import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const logger = new Logger("PET_OWNER_MODEL");

class PetOwner {
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
      const [rows] = await pool.query(
        "SELECT owner_id, full_name, email, contact_number, address, date_registered FROM pet_owner WHERE owner_id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error("Error finding pet owner by id", error);
      throw error;
    }
  }

  static async create(fullName, email, password, contactNumber, address) {
    try {
      const [result] = await pool.query(
        "INSERT INTO pet_owner (full_name, email, password, contact_number, address) VALUES (?, ?, ?, ?, ?)",
        [fullName, email, password, contactNumber, address]
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
      const [rows] = await pool.query(
        "SELECT owner_id, full_name, email, contact_number, address, date_registered FROM pet_owner"
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
