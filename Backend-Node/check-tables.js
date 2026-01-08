import pool from "./config/database.js";

async function checkTables() {
  try {
    // Check users table
    const [userTable] = await pool.query(`SHOW CREATE TABLE users`);
    console.log("Users table structure:");
    console.log(userTable[0]["Create Table"]);
    console.log("\n---\n");

    // Check announcement table
    const [announcementTable] = await pool.query(
      `SHOW CREATE TABLE announcement`
    );
    console.log("Announcement table structure:");
    console.log(announcementTable[0]["Create Table"]);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkTables();
