import { pool } from "./config/database.js";
import Logger from "./utils/logger.js";

const logger = new Logger("VERIFY_CLINIC_MAP");

async function verifySetup() {
  try {
    logger.info("🔍 Verifying ClinicMap setup...\n");

    // 1. Check database tables
    logger.info("1️⃣ Checking database tables...");
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
      AND TABLE_NAME IN (
        'private_clinic',
        'clinic_map_view',
        'clinic_location_history',
        'clinic_inspection_report',
        'clinic_permit_renewal',
        'clinic_complaint'
      )
      ORDER BY TABLE_NAME
    `);

    const requiredTables = [
      "private_clinic",
      "clinic_map_view",
      "clinic_location_history",
      "clinic_inspection_report",
      "clinic_permit_renewal",
      "clinic_complaint",
    ];

    const existingTables = tables.map((t) => t.TABLE_NAME);
    const missingTables = requiredTables.filter(
      (t) => !existingTables.includes(t)
    );

    if (missingTables.length === 0) {
      logger.success("  ✓ All 6 required tables exist");
    } else {
      logger.error(`  ✗ Missing tables: ${missingTables.join(", ")}`);
    }

    // 2. Check private_clinic columns
    logger.info("\n2️⃣ Checking private_clinic columns...");
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
      AND TABLE_NAME = 'private_clinic'
    `);

    const requiredColumns = [
      "barangay",
      "latitude",
      "longitude",
      "operating_hours",
      "permit_expiry_date",
      "accreditation_expiry_date",
      "last_inspection_date",
      "inspection_status",
      "inspection_notes",
      "last_activity_date",
    ];

    const existingColumns = columns.map((c) => c.COLUMN_NAME);
    const missingColumns = requiredColumns.filter(
      (c) => !existingColumns.includes(c)
    );

    if (missingColumns.length === 0) {
      logger.success(
        `  ✓ All ${requiredColumns.length} required columns exist`
      );
    } else {
      logger.error(`  ✗ Missing columns: ${missingColumns.join(", ")}`);
    }

    // 3. Check clinic data
    logger.info("\n3️⃣ Checking clinic data...");
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_clinics,
        SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as with_coordinates,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_clinics,
        SUM(CASE WHEN permit_expiry_date IS NOT NULL THEN 1 ELSE 0 END) as with_permit_dates,
        SUM(CASE WHEN inspection_status IS NOT NULL THEN 1 ELSE 0 END) as with_inspection_status
      FROM private_clinic
    `);

    const stat = stats[0];
    logger.info(`  Total clinics: ${stat.total_clinics}`);
    logger.info(`  With coordinates: ${stat.with_coordinates}`);
    logger.info(`  Active: ${stat.active_clinics}`);
    logger.info(`  With permit dates: ${stat.with_permit_dates}`);
    logger.info(`  With inspection status: ${stat.with_inspection_status}`);

    if (stat.with_coordinates >= 3) {
      logger.success(
        `  ✓ Sufficient clinics with coordinates for map (${stat.with_coordinates})`
      );
    } else {
      logger.warn(
        `  ⚠️ Only ${stat.with_coordinates} clinics with coordinates (recommended: 3+)`
      );
    }

    // 4. Check sample clinics
    logger.info("\n4️⃣ Checking sample clinics...");
    const [sampleClinics] = await pool.query(`
      SELECT clinic_name, barangay, latitude, longitude, status, inspection_status
      FROM private_clinic
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      LIMIT 5
    `);

    if (sampleClinics.length > 0) {
      logger.info("  Sample clinics found:");
      sampleClinics.forEach((clinic, idx) => {
        logger.info(
          `    ${idx + 1}. ${clinic.clinic_name} (${clinic.barangay}) - ${
            clinic.status
          }`
        );
      });
      logger.success(
        `  ✓ ${sampleClinics.length} clinics ready for map display`
      );
    } else {
      logger.warn("  ⚠️ No clinics with coordinates found");
      logger.info("  Run: node add-sample-clinics.js");
    }

    // 5. Check alerts
    logger.info("\n5️⃣ Checking monitoring alerts...");
    const [expiringPermits] = await pool.query(`
      SELECT COUNT(*) as count
      FROM private_clinic
      WHERE permit_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND status = 'Active'
    `);

    const [needsFollowup] = await pool.query(`
      SELECT COUNT(*) as count
      FROM private_clinic
      WHERE inspection_status = 'Needs Follow-up'
        AND status = 'Active'
    `);

    const alertCount = expiringPermits[0].count + needsFollowup[0].count;
    logger.info(`  Expiring permits (30 days): ${expiringPermits[0].count}`);
    logger.info(`  Inspections needing follow-up: ${needsFollowup[0].count}`);
    logger.success(`  ✓ Total alerts: ${alertCount}`);

    // 6. Check indexes
    logger.info("\n6️⃣ Checking database indexes...");
    const [indexes] = await pool.query(`
      SELECT INDEX_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'cityvetcare_db'
        AND TABLE_NAME = 'private_clinic'
        AND INDEX_NAME IN ('idx_clinic_barangay', 'idx_permit_expiry', 'idx_inspection_status')
      GROUP BY INDEX_NAME
    `);

    const requiredIndexes = [
      "idx_clinic_barangay",
      "idx_permit_expiry",
      "idx_inspection_status",
    ];
    const existingIndexes = indexes.map((i) => i.INDEX_NAME);
    const missingIndexes = requiredIndexes.filter(
      (i) => !existingIndexes.includes(i)
    );

    if (missingIndexes.length === 0) {
      logger.success(
        `  ✓ All ${requiredIndexes.length} performance indexes exist`
      );
    } else {
      logger.warn(`  ⚠️ Missing indexes: ${missingIndexes.join(", ")}`);
    }

    // Final Summary
    logger.info("\n" + "=".repeat(60));
    logger.info("📊 VERIFICATION SUMMARY");
    logger.info("=".repeat(60));

    const checks = [
      { name: "Database tables", passed: missingTables.length === 0 },
      { name: "Schema columns", passed: missingColumns.length === 0 },
      { name: "Clinic data", passed: stat.with_coordinates >= 3 },
      { name: "Performance indexes", passed: missingIndexes.length === 0 },
    ];

    checks.forEach((check) => {
      const status = check.passed ? "✅ PASS" : "❌ FAIL";
      logger.info(`  ${status} - ${check.name}`);
    });

    const allPassed = checks.every((c) => c.passed);

    if (allPassed) {
      logger.success("\n🎉 All checks passed! ClinicMap is ready to use!");
      logger.info("\nNext steps:");
      logger.info("  1. Start backend: cd Backend-Node && npm start");
      logger.info("  2. Start frontend: cd Frontend/web && npm run dev");
      logger.info("  3. Navigate to: Clinic Registration → Clinic Map");
    } else {
      logger.warn("\n⚠️ Some checks failed. Please review the issues above.");
      logger.info("\nTo fix:");
      logger.info("  - Missing tables: node setup-clinic-map-db.js");
      logger.info("  - Missing columns: node update-clinic-schema.js");
      logger.info("  - No clinic data: node add-sample-clinics.js");
    }
  } catch (error) {
    logger.error("\n❌ Verification failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

verifySetup().catch((error) => {
  console.error("Verification error:", error);
  process.exit(1);
});
