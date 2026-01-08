import { pool } from "./config/database.js";

async function addCoordinateColumns() {
  try {
    console.log("🔧 Adding latitude and longitude columns to stray_animals...");

    await pool.query(`
      ALTER TABLE stray_animals
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) NULL AFTER location_captured,
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) NULL AFTER latitude
    `);

    console.log("✅ Successfully added coordinate columns");

    // Verify the columns exist
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM stray_animals WHERE Field IN ('latitude', 'longitude')
    `);

    console.log("📊 Columns:", columns.map((c) => c.Field).join(", "));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addCoordinateColumns();
