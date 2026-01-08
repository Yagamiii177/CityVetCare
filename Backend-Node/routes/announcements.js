import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../config/database.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/announcements";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const mapRow = (row, fallbackAuthor = "Admin", attachments = []) => ({
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
  attachments: attachments.map((att) => ({
    id: att.attachment_id,
    fileName: att.file_name,
    fileType: att.file_type,
    fileSize: att.file_size,
    fileUrl: att.file_url,
    uploadedAt: att.uploaded_at,
  })),
  lastUpdated: row.date_updated || row.date_posted,
  isArchived: Boolean(row.is_archived),
  audience: row.audience || "public",
});

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    let query = "SELECT * FROM announcement";
    const params = [];

    // Filter by status if provided (for mobile users to see only Published)
    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY date_posted DESC";

    const [rows] = await pool.query(query, params);

    // Fetch attachments for each announcement
    const announcementIds = rows.map((r) => r.announcement_id);
    let attachmentsMap = {};

    if (announcementIds.length > 0) {
      const [allAttachments] = await pool.query(
        "SELECT * FROM announcement_attachment WHERE announcement_id IN (?)",
        [announcementIds]
      );

      allAttachments.forEach((att) => {
        if (!attachmentsMap[att.announcement_id]) {
          attachmentsMap[att.announcement_id] = [];
        }
        attachmentsMap[att.announcement_id].push(att);
      });
    }

    const data = rows.map((r) =>
      mapRow(r, "Admin", attachmentsMap[r.announcement_id] || [])
    );

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

    // Fetch attachments for this announcement
    const [announcementAttachments] = await pool.query(
      "SELECT * FROM announcement_attachment WHERE announcement_id = ?",
      [req.params.id]
    );

    // Increment view count
    await pool.query(
      "UPDATE announcement SET views = views + 1 WHERE announcement_id = ?",
      [req.params.id]
    );

    res.json({ data: mapRow(rows[0], "Admin", announcementAttachments) });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to fetch announcement" });
  }
});

router.post("/", upload.array("attachments", 5), async (req, res) => {
  try {
    const payload = req.body || {};
    console.log("📝 Creating announcement POST request received");
    console.log("📝 Payload title:", payload.title);
    console.log("📝 Request files:", req.files);
    console.log("📝 Files count:", req.files ? req.files.length : 0);
    console.log("📝 Content-Type:", req.headers["content-type"]);

    if (!payload.title) {
      return res
        .status(400)
        .json({ error: true, message: "Title is required" });
    }

    // Check if admin exists, otherwise create a default admin or use NULL
    let adminId = payload.adminId || 1;

    // Verify admin exists
    const [adminCheck] = await pool.query(
      "SELECT admin_id FROM administrator WHERE admin_id = ? LIMIT 1",
      [adminId]
    );

    // If admin doesn't exist, try to get any admin or create one
    if (adminCheck.length === 0) {
      const [anyAdmin] = await pool.query(
        "SELECT admin_id FROM administrator LIMIT 1"
      );

      if (anyAdmin.length > 0) {
        adminId = anyAdmin[0].admin_id;
      } else {
        // Create a default admin if none exists
        const [newAdmin] = await pool.query(
          "INSERT INTO administrator (full_name, role, username, password) VALUES (?, ?, ?, ?)",
          ["System Admin", "staff", "admin", "$2a$10$defaulthash"]
        );
        adminId = newAdmin.insertId;
      }
    }

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

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      console.log(`📎 Processing ${req.files.length} file attachment(s)`);
      for (const file of req.files) {
        const fileUrl = `/uploads/announcements/${file.filename}`;
        console.log(`  - Saving: ${file.originalname} -> ${fileUrl}`);
        const [attachmentResult] = await pool.query(
          `INSERT INTO announcement_attachment (announcement_id, file_name, file_type, file_size, file_url)
           VALUES (?, ?, ?, ?, ?)`,
          [insertedId, file.originalname, file.mimetype, file.size, fileUrl]
        );
        attachments.push({
          attachment_id: attachmentResult.insertId,
          file_name: file.originalname,
          file_type: file.mimetype,
          file_size: file.size,
          file_url: fileUrl,
          uploaded_at: new Date(),
        });
      }
    }

    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [insertedId]
    );

    res
      .status(201)
      .json({ data: mapRow(rows[0], payload.author || "Admin", attachments) });
  } catch (error) {
    console.error("Error creating announcement:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      error: true,
      message: "Failed to create announcement",
      details: error.message,
    });
  }
});

router.put("/:id", upload.array("attachments", 5), async (req, res) => {
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

    // Handle removed attachments
    if (payload.removedAttachmentIds) {
      try {
        const removedIds = JSON.parse(payload.removedAttachmentIds);
        if (Array.isArray(removedIds) && removedIds.length > 0) {
          // Get file paths before deleting from DB
          const [filesToDelete] = await pool.query(
            "SELECT file_url FROM announcement_attachment WHERE attachment_id IN (?)",
            [removedIds]
          );

          // Delete from database
          await pool.query(
            "DELETE FROM announcement_attachment WHERE attachment_id IN (?)",
            [removedIds]
          );

          // Delete physical files
          filesToDelete.forEach((file) => {
            const filePath = path.join(process.cwd(), file.file_url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
        }
      } catch (parseError) {
        console.error("Error parsing removedAttachmentIds:", parseError);
      }
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = `/uploads/announcements/${file.filename}`;
        await pool.query(
          `INSERT INTO announcement_attachment (announcement_id, file_name, file_type, file_size, file_url)
           VALUES (?, ?, ?, ?, ?)`,
          [req.params.id, file.originalname, file.mimetype, file.size, fileUrl]
        );
      }
    }

    const [rows] = await pool.query(
      "SELECT * FROM announcement WHERE announcement_id = ?",
      [req.params.id]
    );

    // Fetch attachments for updated announcement
    const [updatedAttachments] = await pool.query(
      "SELECT * FROM announcement_attachment WHERE announcement_id = ?",
      [req.params.id]
    );

    res.json({
      data: mapRow(rows[0], payload.author || "Admin", updatedAttachments),
    });
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
      [req.params.id],
      "Admin",
      []
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
      [req.params.id],
      "Admin",
      []
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
