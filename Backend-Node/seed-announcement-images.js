/**
 * Seed sample announcement attachments
 * Run this script to populate announcement_attachment table with sample data
 */

import { pool } from "./config/database.js";
import Logger from "./utils/logger.js";

const logger = new Logger("SEED_ANNOUNCEMENTS");

const sampleAttachments = [
  // Announcement ID 1 - Anti-Rabies Vaccination Campaign
  {
    announcement_id: 1,
    file_name: "anti-rabies-campaign-1.jpg",
    file_type: "image/jpeg",
    file_size: 245600,
    file_url: "/uploads/announcements/anti-rabies-campaign-1.jpg",
    storage_path: "uploads/announcements/anti-rabies-campaign-1.jpg",
  },
  {
    announcement_id: 1,
    file_name: "anti-rabies-campaign-2.jpg",
    file_type: "image/jpeg",
    file_size: 312800,
    file_url: "/uploads/announcements/anti-rabies-campaign-2.jpg",
    storage_path: "uploads/announcements/anti-rabies-campaign-2.jpg",
  },
  {
    announcement_id: 1,
    file_name: "anti-rabies-map.jpg",
    file_type: "image/jpeg",
    file_size: 189400,
    file_url: "/uploads/announcements/anti-rabies-map.jpg",
    storage_path: "uploads/announcements/anti-rabies-map.jpg",
  },

  // Announcement ID 2 - Pet Safety
  {
    announcement_id: 2,
    file_name: "pet-safety-indoor.jpg",
    file_type: "image/jpeg",
    file_size: 198200,
    file_url: "/uploads/announcements/pet-safety-indoor.jpg",
    storage_path: "uploads/announcements/pet-safety-indoor.jpg",
  },
  {
    announcement_id: 2,
    file_name: "pet-safety-tips.jpg",
    file_type: "image/jpeg",
    file_size: 223400,
    file_url: "/uploads/announcements/pet-safety-tips.jpg",
    storage_path: "uploads/announcements/pet-safety-tips.jpg",
  },
];

async function seedAnnouncementAttachments() {
  try {
    logger.info("Starting announcement attachments seeding...");

    // Check if announcements exist
    const [announcements] = await pool.query(
      "SELECT announcement_id FROM announcement LIMIT 5"
    );

    if (announcements.length === 0) {
      logger.warn("No announcements found. Please create announcements first.");
      return;
    }

    logger.info(`Found ${announcements.length} announcements`);

    // Clear existing attachments (optional - comment out if you want to keep existing)
    // await pool.query('DELETE FROM announcement_attachment');
    // logger.info('Cleared existing attachments');

    // Insert sample attachments
    for (const attachment of sampleAttachments) {
      // Check if announcement exists
      const [exists] = await pool.query(
        "SELECT announcement_id FROM announcement WHERE announcement_id = ?",
        [attachment.announcement_id]
      );

      if (exists.length > 0) {
        await pool.query(
          `INSERT INTO announcement_attachment 
          (announcement_id, file_name, file_type, file_size, file_url, storage_path)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            attachment.announcement_id,
            attachment.file_name,
            attachment.file_type,
            attachment.file_size,
            attachment.file_url,
            attachment.storage_path,
          ]
        );
        logger.info(
          `✓ Added attachment: ${attachment.file_name} to announcement ${attachment.announcement_id}`
        );
      } else {
        logger.warn(
          `⚠ Announcement ${attachment.announcement_id} not found, skipping attachment`
        );
      }
    }

    logger.success("✅ Announcement attachments seeded successfully!");

    // Show summary
    const [counts] = await pool.query(`
      SELECT 
        a.announcement_id, 
        a.title,
        COUNT(aa.attachment_id) as attachment_count
      FROM announcement a
      LEFT JOIN announcement_attachment aa ON a.announcement_id = aa.announcement_id
      GROUP BY a.announcement_id, a.title
      LIMIT 10
    `);

    console.log("\n📊 Announcement Attachments Summary:");
    console.log("=====================================");
    counts.forEach((row) => {
      console.log(`• ${row.title}: ${row.attachment_count} image(s)`);
    });

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding announcement attachments:", error);
    process.exit(1);
  }
}

seedAnnouncementAttachments();
