import express from "express";
import multer from "multer";
import { pool } from "../config/database.js";

const router = express.Router();
const upload = multer(); // handle multipart/form-data with no files

const mapRow = (row, fallbackAuthor = "Admin") => ({
  id: row.announcement_id,
  title: row.title,
  description: row.description || row.content || "",
  content: row.content,
  category: row.category || "general",
  categoryName: row.category || "General Info",
  author: row.author || fallbackAuthor,
  publishDate:
    row.publish_date || row.published_at || row.date_posted?.toISOString?.(),
  status: row.status || "Draft",
  priority: row.priority || "Medium",
  views: row.views || 0,
  attachments: [],
  lastUpdated: row.date_updated || row.date_posted,
  isArchived: Boolean(row.is_archived),
  audience: row.audience || "public",
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcement ORDER BY date_posted DESC"
    );
    const data = rows.map((r) => mapRow(r));
    res.json({ data });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to fetch announcements" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    if (!rows.length) {
      return res
        .status(404)
        .json({ error: true, message: "Announcement not found" });
    }
    res.json({ data: mapRow(rows[0]) });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to fetch announcement" });
  }
});

router.post("/", upload.none(), async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.title) {
      return res
        .status(400)
        .json({ error: true, message: "Title is required" });
    }

    const adminId = payload.adminId || 1;
    const description = payload.description || payload.content || "";
    const content = payload.content || description || "";
    const category = payload.category || "general";
    const priority = payload.priority || "Medium";
    const audience = payload.audience || "public";
    const status = payload.status || "Draft";
    const publishDate = payload.publishDate || null;
    const scheduledFor = payload.scheduledFor || null;
    const publishDateValue = publishDate || null;
    const publishedAtValue = status === "Published" ? new Date() : null;
    const scheduledForValue = status === "Scheduled" ? scheduledFor : null;

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
        publishDateValue,
        publishedAtValue,
        scheduledForValue,
      ]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [insertedId]
    );

    res.status(201).json({ data: mapRow(rows[0], payload.author || "Admin") });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to create announcement" });
  }
});

router.put("/:id", upload.none(), async (req, res) => {
  try {
    const payload = req.body || {};
    const [existingRows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    if (!existingRows.length) {
      return res
        .status(404)
        .json({ error: true, message: "Announcement not found" });
    }

    const existing = existingRows[0];
    const description =
      payload.description || payload.content || existing.description;
    const content = payload.content || existing.content;
    const category = payload.category || existing.category;
    const priority = payload.priority || existing.priority;
    const audience = payload.audience || existing.audience || "public";
    const status = payload.status || existing.status;
    const publishDate = payload.publishDate || existing.publish_date;
    const scheduledFor = payload.scheduledFor || existing.scheduled_for;
    const publishedAtValue =
      status === "Published" ? new Date() : existing.published_at;
    const scheduledForValue = status === "Scheduled" ? scheduledFor : null;
    const isArchived = status === "Archived" ? 1 : 0;

    await pool.query(
      `UPDATE announcement
       SET title = ?, content = ?, description = ?, category = ?, priority = ?, audience = ?, status = ?, publish_date = ?, published_at = ?, scheduled_for = ?, is_archived = ?
       WHERE announcement_id = ?`,
      [
        payload.title || existing.title,
        content,
        description,
        category,
        priority,
        audience,
        status,
        publishDate,
        publishedAtValue,
        scheduledForValue,
        isArchived,
        req.params.id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    res.json({ data: mapRow(rows[0], payload.author || "Admin") });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to update announcement" });
  }
});

router.patch("/:id/archive", async (req, res) => {
  try {
    const [existingRows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    if (!existingRows.length) {
      return res
        .status(404)
        .json({ error: true, message: "Announcement not found" });
    }

    await pool.query(
      "UPDATE announcement SET is_archived = 1, status = 'Archived', date_updated = NOW() WHERE announcement_id = ?",
      [req.params.id]
    );

    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    res.json({ data: mapRow(rows[0]) });
  } catch (error) {
    console.error("Error archiving announcement:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to archive announcement" });
  }
});

router.patch("/:id/restore", async (req, res) => {
  try {
    const [existingRows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    if (!existingRows.length) {
      return res
        .status(404)
        .json({ error: true, message: "Announcement not found" });
    }

    await pool.query(
      "UPDATE announcement SET is_archived = 0, status = 'Draft', date_updated = NOW() WHERE announcement_id = ?",
      [req.params.id]
    );

    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );
    res.json({ data: mapRow(rows[0]) });
  } catch (error) {
    console.error("Error restoring announcement:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to restore announcement" });
  }
});

export default router;
