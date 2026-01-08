import pool from "./config/database.js";

async function listTables() {
  try {
    const [tables] = await pool.query(`SHOW TABLES`);
    console.log("Tables in database:");
    tables.forEach((table) => {
      console.log("- ", Object.values(table)[0]);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

listTables();
