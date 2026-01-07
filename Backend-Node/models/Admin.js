import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";

const logger = new Logger("ADMIN_MODEL");

class Admin {
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM administrator WHERE username = ?",
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error("Error finding admin by username", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT admin_id, full_name, username, role, date_created, date_updated FROM administrator WHERE admin_id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error("Error finding admin by id", error);
      throw error;
    }
  }

  static async create(fullName, username, hashedPassword, role) {
    try {
      const [result] = await pool.query(
        "INSERT INTO administrator (full_name, username, password, role) VALUES (?, ?, ?, ?)",
        [fullName, username, hashedPassword, role]
      );
      return result;
    } catch (error) {
      logger.error("Error creating admin", error);
      throw error;
    }
  }

  static async update(id, fullName, username, role) {
    try {
      const [result] = await pool.query(
        "UPDATE administrator SET full_name = ?, username = ?, role = ?, date_updated = CURRENT_TIMESTAMP WHERE admin_id = ?",
        [fullName, username, role, id]
      );
      return result;
    } catch (error) {
      logger.error("Error updating admin", error);
      throw error;
    }
  }

  static async updatePassword(id, hashedPassword) {
    try {
      const [result] = await pool.query(
        "UPDATE administrator SET password = ?, date_updated = CURRENT_TIMESTAMP WHERE admin_id = ?",
        [hashedPassword, id]
      );
      return result;
    } catch (error) {
      logger.error("Error updating admin password", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query(
        "DELETE FROM administrator WHERE admin_id = ?",
        [id]
      );
      return result;
    } catch (error) {
      logger.error("Error deleting admin", error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.query(
        "SELECT admin_id, full_name, username, role, date_created, date_updated FROM administrator"
      );
      return rows;
    } catch (error) {
      logger.error("Error getting all admins", error);
      throw error;
    }
  }

  static async countByRole(role) {
    try {
      const [rows] = await pool.query(
        "SELECT COUNT(*) as count FROM administrator WHERE role = ?",
        [role]
      );
      return rows[0].count;
    } catch (error) {
      logger.error("Error counting admins by role", error);
      throw error;
    }
  }
}

export default Admin;
