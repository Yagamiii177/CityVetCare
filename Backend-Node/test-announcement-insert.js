import pool from "./config/database.js";

(async () => {
  try {
    console.log("Testing announcement creation...\n");

    // Simulate the exact data from frontend
    const payload = {
      title: "Test Announcement",
      description: "Test description",
      content: "Test content",
      category: "general",
      priority: "Medium",
      audience: "public",
      status: "Draft",
    };

    const adminId = 1;
    const description = payload.description || payload.content || "";
    const content = payload.content || description || "";
    const category = payload.category || "general";
    const priority = payload.priority || "Medium";
    const audience = payload.audience || "public";
    const status = payload.status || "Draft";
    const publishDate = null;
    const publishedAtValue = status === "Published" ? new Date() : null;
    const scheduledForValue = status === "Scheduled" ? null : null;

    console.log("Attempting to insert with parameters:");
    console.log("  adminId:", adminId);
    console.log("  title:", payload.title);
    console.log("  content:", content);
    console.log("  description:", description);
    console.log("  category:", category);
    console.log("  priority:", priority);
    console.log("  audience:", audience);
    console.log("  status:", status);
    console.log("  publish_date:", publishDate);
    console.log("  published_at:", publishedAtValue);
    console.log("  scheduled_for:", scheduledForValue);
    console.log();

    const [result] = await pool.query(
      `INSERT INTO announcement
        (admin_id, title, content, description, category, priority, audience, status, publish_date, published_at, scheduled_for, is_archived, views)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        adminId,
        payload.title,
        content,
        description,
        category,
        priority,
        audience,
        status,
        publishDate,
        publishedAtValue,
        scheduledForValue,
      ]
    );

    console.log("✅ Success! Inserted announcement with ID:", result.insertId);

    // Clean up - delete the test announcement
    await pool.query("DELETE FROM announcement WHERE announcement_id = ?", [
      result.insertId,
    ]);
    console.log("🧹 Cleaned up test data");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
})();
