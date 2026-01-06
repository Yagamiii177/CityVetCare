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

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log("✓ Database and tables created successfully");
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
