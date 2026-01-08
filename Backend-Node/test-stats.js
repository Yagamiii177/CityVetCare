import { pool } from "./config/database.js";

async function testStats() {
  try {
    const userId = 1;

    const [stats] = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT CASE WHEN COALESCE(uai.is_hidden, 0) = 0 THEN a.announcement_id END) as \`total\`,
        SUM(CASE WHEN COALESCE(uai.is_hidden, 0) = 0 AND COALESCE(uai.is_read, 0) = 0 THEN 1 ELSE 0 END) as \`unread\`,
        SUM(CASE WHEN COALESCE(uai.is_hidden, 0) = 0 AND uai.is_read = 1 THEN 1 ELSE 0 END) as \`read\`,
        SUM(CASE WHEN COALESCE(uai.is_hidden, 0) = 1 THEN 1 ELSE 0 END) as \`hidden\`
      FROM announcement a
      LEFT JOIN user_announcement_interaction uai 
        ON a.announcement_id = uai.announcement_id 
        AND uai.user_id = ?
      WHERE a.status = 'Published'
    `,
      [userId]
    );

    console.log("Stats Query Result:", stats[0]);

    // Also check raw data
    const [announcements] = await pool.query(
      `SELECT 
        a.announcement_id, 
        a.title, 
        a.status,
        uai.is_hidden,
        uai.is_read
      FROM announcement a
      LEFT JOIN user_announcement_interaction uai 
        ON a.announcement_id = uai.announcement_id 
        AND uai.user_id = ?
      WHERE a.status = 'Published'`,
      [userId]
    );

    console.log("\nAll Published Announcements:");
    announcements.forEach((a) => {
      console.log(
        `  ID: ${a.announcement_id}, Title: ${a.title}, Hidden: ${a.is_hidden}, Read: ${a.is_read}`
      );
    });

    await pool.end();
  } catch (error) {
    console.error("Error:", error);
    await pool.end();
  }
}

testStats();
