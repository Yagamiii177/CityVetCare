import { pool } from "./config/database.js";

async function viewUserInteractions() {
  try {
    console.log("📊 User Announcement Interactions:\n");

    const [rows] = await pool.query(`
      SELECT 
        uai.*,
        a.title as announcement_title
      FROM user_announcement_interaction uai
      LEFT JOIN announcement a ON uai.announcement_id = a.announcement_id
      ORDER BY uai.created_at DESC
      LIMIT 20
    `);

    if (rows.length === 0) {
      console.log("No interactions found yet.");
    } else {
      console.log(`Found ${rows.length} interaction(s):\n`);
      rows.forEach((row) => {
        console.log(
          `User ${row.user_id} → Announcement: "${row.announcement_title}"`
        );
        console.log(
          `  Read: ${row.is_read ? "✅" : "❌"} | Hidden: ${
            row.is_hidden ? "✅" : "❌"
          }`
        );
        console.log(`  Read at: ${row.read_at || "N/A"}`);
        console.log(`  Created: ${row.created_at}`);
        console.log("");
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

viewUserInteractions();
