import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const clearIncidentData = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "cityvetcare_db",
    });

    console.log("🔗 Connected to database");
    console.log("=" .repeat(70));
    console.log("CLEARING INCIDENT DATA");
    console.log("=" .repeat(70));

    // Count existing records before deletion
    const [reportCount] = await connection.query(
      "SELECT COUNT(*) as count FROM incident_report"
    );
    const [imageCount] = await connection.query(
      "SELECT COUNT(*) as count FROM report_image"
    );
    const [petCount] = await connection.query(
      "SELECT COUNT(*) as count FROM incident_pet"
    );
    const [locationCount] = await connection.query(
      "SELECT COUNT(*) as count FROM incident_location"
    );
    const [reporterCount] = await connection.query(
      "SELECT COUNT(*) as count FROM reporter"
    );

    console.log("\n📊 Current Record Counts:");
    console.log(`  Incident Reports: ${reportCount[0].count}`);
    console.log(`  Report Images: ${imageCount[0].count}`);
    console.log(`  Incident Pets: ${petCount[0].count}`);
    console.log(`  Locations: ${locationCount[0].count}`);
    console.log(`  Reporters: ${reporterCount[0].count}`);

    if (reportCount[0].count === 0) {
      console.log("\n✅ No incident data to delete. Database is already clean.");
      return;
    }

    console.log("\n🗑️  Deleting incident data...");

    // Delete in correct order due to foreign key constraints
    // 1. Delete report images first (references report_id)
    const [imageResult] = await connection.query(
      "DELETE FROM report_image"
    );
    console.log(`  ✓ Deleted ${imageResult.affectedRows} report images`);

    // 2. Delete incident pets (references report_id)
    const [petResult] = await connection.query(
      "DELETE FROM incident_pet"
    );
    console.log(`  ✓ Deleted ${petResult.affectedRows} incident pet records`);

    // 3. Delete incident reports (references reporter_id and location_id)
    const [reportResult] = await connection.query(
      "DELETE FROM incident_report"
    );
    console.log(`  ✓ Deleted ${reportResult.affectedRows} incident reports`);

    // 4. Delete reporters (no longer referenced)
    const [reporterResult] = await connection.query(
      "DELETE FROM reporter"
    );
    console.log(`  ✓ Deleted ${reporterResult.affectedRows} reporters`);

    // 5. Delete locations (no longer referenced)
    const [locationResult] = await connection.query(
      "DELETE FROM incident_location"
    );
    console.log(`  ✓ Deleted ${locationResult.affectedRows} locations`);

    // Reset auto-increment counters to start fresh
    console.log("\n🔄 Resetting auto-increment counters...");
    await connection.query("ALTER TABLE report_image AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE incident_pet AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE incident_report AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE reporter AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE incident_location AUTO_INCREMENT = 1");
    console.log("  ✓ Auto-increment counters reset");

    console.log("\n" + "=".repeat(70));
    console.log("✅ ALL INCIDENT DATA CLEARED SUCCESSFULLY");
    console.log("=".repeat(70));
    console.log("\nYou can now submit new incident reports.");
    console.log("The database structure remains intact.\n");

  } catch (error) {
    console.error("\n❌ Error clearing incident data:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed\n");
    }
  }
};

// Run the script
clearIncidentData().catch(console.error);
