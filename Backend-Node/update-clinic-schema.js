import { pool } from "./config/database.js";
import Logger from "./utils/logger.js";

const logger = new Logger("SCHEMA_UPDATE");

async function updateSchema() {
  try {
    logger.info("Updating private_clinic table schema...");

    // Add missing columns one by one
    const alterStatements = [
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS barangay VARCHAR(100) AFTER address",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) AFTER barangay",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) AFTER latitude",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS operating_hours JSON AFTER services",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS permit_expiry_date DATE AFTER status",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS accreditation_expiry_date DATE AFTER permit_expiry_date",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS last_inspection_date DATE AFTER accreditation_expiry_date",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS inspection_status ENUM('Passed', 'Pending', 'Needs Follow-up') DEFAULT 'Pending' AFTER last_inspection_date",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS inspection_notes TEXT AFTER inspection_status",
      "ALTER TABLE private_clinic ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER inspection_notes",
      "ALTER TABLE private_clinic MODIFY COLUMN status ENUM('Active', 'Pending', 'Inactive', 'Suspended', 'Temporarily Closed') DEFAULT 'Pending'",
    ];

    for (const statement of alterStatements) {
      try {
        await pool.query(statement);
        logger.info(`✓ Executed: ${statement.substring(0, 80)}...`);
      } catch (error) {
        if (error.message.includes("Duplicate column name")) {
          logger.info(`  Column already exists, skipping`);
        } else {
          logger.warn(`Warning: ${error.message}`);
        }
      }
    }

    // Add indexes
    const indexStatements = [
      "CREATE INDEX IF NOT EXISTS idx_clinic_barangay ON private_clinic(barangay)",
      "CREATE INDEX IF NOT EXISTS idx_permit_expiry ON private_clinic(permit_expiry_date)",
      "CREATE INDEX IF NOT EXISTS idx_inspection_status ON private_clinic(inspection_status)",
    ];

    for (const statement of indexStatements) {
      try {
        await pool.query(statement);
        logger.info(`✓ Index created`);
      } catch (error) {
        if (error.message.includes("Duplicate key name")) {
          logger.info(`  Index already exists, skipping`);
        } else {
          logger.warn(`Warning: ${error.message}`);
        }
      }
    }

    // Verify columns
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
      AND TABLE_NAME = 'private_clinic'
      ORDER BY ORDINAL_POSITION
    `);

    logger.info("\nCurrent columns in private_clinic:");
    columns.forEach((col) => logger.info(`  - ${col.COLUMN_NAME}`));

    logger.success("\n✓ Schema update completed!");
  } catch (error) {
    logger.error("Error updating schema:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

updateSchema().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
