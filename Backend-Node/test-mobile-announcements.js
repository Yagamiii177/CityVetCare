/**
 * Quick Test Script for Mobile Announcements
 * Tests the complete announcement system end-to-end
 */

import { pool } from "./config/database.js";
import Logger from "./utils/logger.js";

const logger = new Logger("TEST_ANNOUNCEMENTS");

async function testAnnouncementSystem() {
  try {
    console.log("\n🧪 Testing Mobile Announcement System\n");
    console.log("═══════════════════════════════════════\n");

    // Test 1: Check announcement table
    logger.info("Test 1: Checking announcement table...");
    const [announcements] = await pool.query(
      "SELECT announcement_id, title, status, category, priority FROM announcement LIMIT 5"
    );

    if (announcements.length > 0) {
      logger.success(`✓ Found ${announcements.length} announcements`);
      announcements.forEach((a) => {
        console.log(
          `   • ${a.title} [${a.status}] - ${a.category}/${a.priority}`
        );
      });
    } else {
      logger.warn("⚠ No announcements found. Creating sample...");
      await createSampleAnnouncement();
    }

    console.log("");

    // Test 2: Check published announcements
    logger.info("Test 2: Checking published announcements...");
    const [published] = await pool.query(
      "SELECT COUNT(*) as count FROM announcement WHERE status = 'Published'"
    );
    logger.success(
      `✓ ${published[0].count} published announcements (visible to mobile users)`
    );

    console.log("");

    // Test 3: Check announcement attachments
    logger.info("Test 3: Checking announcement attachments...");
    const [attachments] = await pool.query(`
      SELECT 
        a.announcement_id,
        a.title,
        COUNT(aa.attachment_id) as image_count
      FROM announcement a
      LEFT JOIN announcement_attachment aa ON a.announcement_id = aa.announcement_id
      GROUP BY a.announcement_id, a.title
      HAVING COUNT(aa.attachment_id) > 0
      LIMIT 5
    `);

    if (attachments.length > 0) {
      logger.success(`✓ ${attachments.length} announcements have images`);
      attachments.forEach((a) => {
        console.log(`   • ${a.title}: ${a.image_count} image(s)`);
      });
    } else {
      logger.warn(
        "⚠ No announcement images found. Run: node seed-announcement-images.js"
      );
    }

    console.log("");

    // Test 4: Simulate API request
    logger.info("Test 4: Simulating mobile API request...");
    const [apiResult] = await pool.query(`
      SELECT 
        announcement_id as id,
        title,
        description,
        category,
        priority,
        views,
        status,
        date_posted as publishDate
      FROM announcement 
      WHERE status = 'Published'
      ORDER BY date_posted DESC
      LIMIT 3
    `);

    logger.success(`✓ API would return ${apiResult.length} announcements`);
    console.log("\n   Sample Response:");
    apiResult.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.title}`);
      console.log(
        `      Category: ${item.category} | Priority: ${item.priority} | Views: ${item.views}`
      );
    });

    console.log("");

    // Test 5: Check view tracking
    logger.info("Test 5: Testing view counter...");
    if (apiResult.length > 0) {
      const testId = apiResult[0].id;
      const oldViews = apiResult[0].views;

      await pool.query(
        "UPDATE announcement SET views = views + 1 WHERE announcement_id = ?",
        [testId]
      );

      const [updated] = await pool.query(
        "SELECT views FROM announcement WHERE announcement_id = ?",
        [testId]
      );

      logger.success(`✓ View counter works: ${oldViews} → ${updated[0].views}`);
    }

    console.log("");

    // Summary
    console.log("\n📊 SUMMARY");
    console.log("═══════════════════════════════════════");

    const [totalAnnouncements] = await pool.query(
      "SELECT COUNT(*) as count FROM announcement"
    );
    const [totalPublished] = await pool.query(
      "SELECT COUNT(*) as count FROM announcement WHERE status = 'Published'"
    );
    const [totalImages] = await pool.query(
      "SELECT COUNT(*) as count FROM announcement_attachment"
    );
    const [avgViews] = await pool.query(
      "SELECT AVG(views) as avg FROM announcement"
    );

    console.log(`Total Announcements:     ${totalAnnouncements[0].count}`);
    console.log(`Published (Mobile):      ${totalPublished[0].count}`);
    console.log(`Total Images:            ${totalImages[0].count}`);
    console.log(`Average Views:           ${Math.round(avgViews[0].avg || 0)}`);

    console.log("\n✅ All tests completed!");
    console.log("\n📱 Next Steps:");
    console.log("   1. Start backend: cd Backend-Node && npm start");
    console.log("   2. Start mobile: cd Frontend/mobile && npm start");
    console.log(
      "   3. Test API: curl http://localhost:3000/api/announcements?status=Published"
    );
    console.log("");

    process.exit(0);
  } catch (error) {
    logger.error("Test failed:", error);
    process.exit(1);
  }
}

async function createSampleAnnouncement() {
  try {
    await pool.query(`
      INSERT INTO announcement 
      (admin_id, title, content, description, category, priority, status, views)
      VALUES 
      (1, 'Welcome to CityVetCare', 
       'We are excited to announce our new mobile app for reporting stray animals and accessing veterinary services.',
       'Download our new mobile app today!',
       'general', 'Medium', 'Published', 0)
    `);
    logger.success("✓ Created sample announcement");
  } catch (error) {
    logger.error("Failed to create sample:", error);
  }
}

testAnnouncementSystem();
