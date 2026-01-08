import pool from "./config/database.js";

(async () => {
  try {
    console.log("Checking administrator table...");

    const [admins] = await pool.query(
      "SELECT admin_id, full_name, username FROM administrator LIMIT 5"
    );

    if (admins.length === 0) {
      console.log("❌ No administrators found in database");
    } else {
      console.log(`✅ Found ${admins.length} administrator(s):`);
      admins.forEach((admin) => {
        console.log(
          `   - ID: ${admin.admin_id}, Name: ${admin.full_name}, Username: ${admin.username}`
        );
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking database:", error.message);
    process.exit(1);
  }
})();
