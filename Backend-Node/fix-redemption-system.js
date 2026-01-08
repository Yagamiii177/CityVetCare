import { pool } from "./config/database.js";

async function fixRedemptionSystem() {
  try {
    console.log("🔧 Fixing redemption request system...\n");

    // 1. Check and add 'claimed' status to stray_animals enum
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

    if (!currentEnum.includes("'claimed'")) {
      console.log("   ➕ Adding 'claimed' status...");
      await pool.query(`
        ALTER TABLE stray_animals
          MODIFY COLUMN status ENUM('captured', 'adoption', 'euthanized', 'claimed') NOT NULL DEFAULT 'captured'
      `);
      console.log("   ✅ Added 'claimed' status");
    } else {
      console.log("   ✓ 'claimed' status already exists");
    }

    // 2. Verify redemption_request columns
    console.log("\n2️⃣ Verifying redemption_request columns...");
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM redemption_request
    `);
    const columnNames = columns.map((c) => c.Field);
    console.log("   Columns:", columnNames.join(", "));

    const requiredColumns = ["owner_contact", "proof_images"];
    const missingColumns = requiredColumns.filter(
      (col) => !columnNames.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log("   ⚠️ Missing columns:", missingColumns.join(", "));
    } else {
      console.log("   ✓ All required columns exist");
    }

    // 3. Test a simple query
    console.log("\n3️⃣ Testing redemption requests query...");
    const [testRows] = await pool.query(`
      SELECT rr.*,
             sa.name as animal_name,
             sa.species, sa.breed
      FROM redemption_request rr
      JOIN stray_animals sa ON rr.stray_id = sa.animal_id
      LIMIT 1
    `);
    console.log(`   ✅ Query successful (${testRows.length} rows found)`);

    console.log("\n✅ Redemption request system is ready!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Details:", error);
    process.exit(1);
  }
}

fixRedemptionSystem();
