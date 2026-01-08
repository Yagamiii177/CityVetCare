import { pool } from "./config/database.js";

async function checkAnnouncements() {
  try {
    console.log("📋 Checking announcements and attachments...\n");

    // Get all announcements
    const [announcements] = await pool.query(
      "SELECT announcement_id, title, status FROM announcement ORDER BY date_posted DESC LIMIT 5"
    );

    console.log(`Found ${announcements.length} announcements:\n`);

    for (const ann of announcements) {
      console.log(
        `📢 ID: ${ann.announcement_id} - ${ann.title} (${ann.status})`
      );

      // Get attachments for this announcement
      const [attachments] = await pool.query(
        "SELECT * FROM announcement_attachment WHERE announcement_id = ?",
        [ann.announcement_id]
      );

      if (attachments.length > 0) {
        console.log(`   📎 ${attachments.length} attachment(s):`);
        attachments.forEach((att) => {
          console.log(`      - ${att.file_name} (${att.file_type})`);
          console.log(`        URL: ${att.file_url}`);
          console.log(`        Size: ${(att.file_size / 1024).toFixed(2)} KB`);
        });
      } else {
        console.log("   📎 No attachments");
      }
      console.log("");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAnnouncements();
