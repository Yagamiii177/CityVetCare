import { pool } from "./config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("📝 Running migration...");

    const migrationPath = path.join(
      __dirname,
      "..",
      "Database",
      "migrations",
      "20260108_add_proof_images_to_redemption_request.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Executing SQL:");
    console.log(sql);

    await pool.query(sql);

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
