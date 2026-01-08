import { pool } from "./config/database.js";

async function addStrayIdToNotifications() {
  try {
    console.log("🔧 Adding stray_animal_id to notifications table...\n");

    // Check if column exists
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM notifications WHERE Field = 'stray_animal_id'
    `);

    if (columns.length === 0) {
      console.log("➕ Adding stray_animal_id column...");
      await pool.query(`
        ALTER TABLE notifications
          ADD COLUMN stray_animal_id INT NULL AFTER type,
          ADD INDEX idx_stray_notification (stray_animal_id)
      `);
      console.log("✅ Added stray_animal_id column");
    } else {
      console.log("✓ stray_animal_id column already exists");
    }

    // Verify
    const [updatedColumns] = await pool.query(`
      SHOW COLUMNS FROM notifications
    `);
    console.log("\n📊 Columns:", updatedColumns.map((c) => c.Field).join(", "));

    console.log("\n✅ Notifications table updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addStrayIdToNotifications();
