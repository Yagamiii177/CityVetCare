import { pool } from "./config/database.js";

async function addRedemptionColumns() {
  try {
    console.log("🔧 Adding missing columns to redemption_request table...");

    // Check existing columns
    const [existingColumns] = await pool.query(`
      SHOW COLUMNS FROM redemption_request
    `);
    const columnNames = existingColumns.map((c) => c.Field);
    console.log("📊 Existing columns:", columnNames.join(", "));

    // Add owner_contact if it doesn't exist
    if (!columnNames.includes("owner_contact")) {
      console.log("➕ Adding owner_contact column...");
      await pool.query(`
        ALTER TABLE redemption_request
          ADD COLUMN owner_contact VARCHAR(50) NULL AFTER remarks
      `);
      console.log("✅ Added owner_contact column");
    } else {
      console.log("✓ owner_contact column already exists");
    }

    // Add proof_images if it doesn't exist
    if (!columnNames.includes("proof_images")) {
      console.log("➕ Adding proof_images column...");
      await pool.query(`
        ALTER TABLE redemption_request
          ADD COLUMN proof_images TEXT NULL AFTER owner_contact
      `);
      console.log("✅ Added proof_images column");
    } else {
      console.log("✓ proof_images column already exists");
    }

    // Verify the columns now exist
    const [updatedColumns] = await pool.query(`
      SHOW COLUMNS FROM redemption_request
    `);
    console.log(
      "\n📊 Updated columns:",
      updatedColumns.map((c) => c.Field).join(", ")
    );

    console.log("\n✅ Redemption request table updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addRedemptionColumns();
