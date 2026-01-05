import { pool } from "./config/database.js";

async function showDatabaseInfo() {
  try {
    // Get database name from connection
    const [dbInfo] = await pool.query("SELECT DATABASE() as db_name");
    const databaseName = dbInfo[0].db_name;

    // Get all tables
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map((row) => Object.values(row)[0]);

    // Display information
    console.log(`Database: ${databaseName}`);
    console.log(`Total Tables: ${tableNames.length}`);

    if (tableNames.length > 0) {
      console.log("");
      console.log("Tables:");
      tableNames.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table}`);
      });
    }
  } catch (error) {
    console.error("Error connecting to database:", error.message);
  } finally {
    await pool.end();
  }
}

showDatabaseInfo();
