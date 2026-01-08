/**
 * Database Setup Script for User Announcement Tracking
 */

import pool from "./config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log("Setting up user announcement tracking table...");

    // Create the table (without FK to users since there's no users table)
    // Using reporter table as the user reference
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_announcement_interaction (
        interaction_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        announcement_id INT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        is_hidden TINYINT(1) DEFAULT 0,
        read_at TIMESTAMP NULL,
        hidden_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_user_announcement FOREIGN KEY (announcement_id) 
          REFERENCES announcement(announcement_id) ON DELETE CASCADE,
        
        UNIQUE KEY unique_user_announcement (user_id, announcement_id),
        
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_user_hidden (user_id, is_hidden),
        INDEX idx_announcement_read (announcement_id, is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Table created successfully!");

    // Check if table exists
    const [tables] = await pool.query(`
      SHOW TABLES LIKE 'user_announcement_interaction'
    `);

    if (tables.length > 0) {
      console.log("✅ Verified: user_announcement_interaction table exists");

      // Show table structure
      const [columns] = await pool.query(`
        DESCRIBE user_announcement_interaction
      `);

      console.log("\nTable structure:");
      console.table(columns);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    process.exit(1);
  }
}

setupDatabase();
