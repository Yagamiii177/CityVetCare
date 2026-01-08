import { pool } from "./config/database.js";

async function fixAdoptionSystem() {
  try {
    console.log("🔧 Fixing adoption request system...\n");

    // Ensure stray_animals.status enum contains 'adopted'
    console.log("1️⃣ Checking stray_animals status enum...");
    const [statusColumn] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
        AND TABLE_NAME = 'stray_animals' 
        AND COLUMN_NAME = 'status'
    `);

    const currentEnum = statusColumn[0]?.COLUMN_TYPE || "";
    console.log("   Current enum:", currentEnum);

    const needsAdopted = !currentEnum.includes("'adopted'");
    if (needsAdopted) {
      console.log("   ➕ Adding 'adopted' status...");
      // Use a conservative set of statuses currently used by the app.
      await pool.query(`
        ALTER TABLE stray_animals
          MODIFY COLUMN status ENUM('captured', 'adoption', 'adopted', 'euthanized', 'claimed') NOT NULL DEFAULT 'captured'
      `);
      console.log("   ✅ Added 'adopted' status");
    } else {
      console.log("   ✓ 'adopted' status already exists");
    }

    console.log("\n✅ Adoption request system is ready!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Details:", error);
    process.exit(1);
  }
}

fixAdoptionSystem();
