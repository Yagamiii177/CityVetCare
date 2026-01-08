import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resetDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    connectTimeout: 60000,
  });

  try {
    console.log("🔄 Resetting database...");

    // Drop database
    console.log("📌 Dropping existing database...");
    await connection.query("DROP DATABASE IF EXISTS cityvetcare_db");
    console.log("✓ Database dropped");

    // Read schema file
    const schemaPath = path.join(__dirname, "..", "Database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split schema into individual statements and execute
    console.log("📌 Creating fresh database and tables...");
    const statements = schema
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await connection.query(statement);
        } catch (error) {
          console.error(
            `❌ Error executing statement ${i + 1}:`,
            error.message
          );
          // Continue with next statement for non-critical errors
          if (!error.message.includes("already exists")) {
            throw error;
          }
        }
      }
    }

    console.log("✓ Database and tables created successfully");

    // Create user_announcement_interaction table (custom table not in schema.sql)
    console.log("📌 Creating user_announcement_interaction table...");
    await connection.query("USE cityvetcare_db");

    const userAnnouncementTable = `
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
        UNIQUE KEY unique_user_announcement (user_id, announcement_id),
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_user_hidden (user_id, is_hidden),
        INDEX idx_announcement_read (announcement_id, is_read),
        CONSTRAINT fk_user_announcement_announcement 
          FOREIGN KEY (announcement_id) 
          REFERENCES announcement(announcement_id) 
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.query(userAnnouncementTable);
    console.log("✓ user_announcement_interaction table created");

    console.log("✅ Database reset complete!");
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

resetDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
