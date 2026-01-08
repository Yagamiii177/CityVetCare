/**
 * User Announcement Interaction Routes
 * Handles read/unread tracking, hiding, and archiving for mobile users
 */

import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

/**
 * GET /api/user-announcements/:userId
 * Get all announcements with user's interaction state
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, filter, search } = req.query;

    // Base query to get announcements with user interaction state
    let query = `
      SELECT 
        a.*,
        COALESCE(uai.is_read, 0) as is_read,
        COALESCE(uai.is_hidden, 0) as is_hidden,
        uai.read_at,
        uai.hidden_at
      FROM announcement a
      LEFT JOIN user_announcement_interaction uai 
        ON a.announcement_id = uai.announcement_id 
        AND uai.user_id = ?
      WHERE 1=1
    `;

    const params = [userId];

    // Filter by status (Published only for regular users)
    if (status) {
      query += " AND a.status = ?";
      params.push(status);
    } else {
      query += " AND a.status = 'Published'";
    }

    // Apply filters
    if (filter === "unread") {
      query += " AND COALESCE(uai.is_read, 0) = 0";
    } else if (filter === "read") {
      query += " AND uai.is_read = 1";
    } else if (filter === "hidden") {
      query += " AND uai.is_hidden = 1";
    } else if (filter !== "hidden") {
      // By default, don't show hidden announcements
      query += " AND COALESCE(uai.is_hidden, 0) = 0";
    }

    // Search functionality
    if (search) {
      query +=
        " AND (a.title LIKE ? OR a.content LIKE ? OR a.description LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY a.date_posted DESC";

    const [rows] = await pool.query(query, params);

    // Get attachments for each announcement
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

    // Map results
    const data = rows.map((r) => ({
      id: r.announcement_id,
      title: r.title,
      description: r.description || r.content || "",
      content: r.content,
      category: r.category || "general",
      categoryName: r.category || "General Info",
      author: r.author || "Admin",
      publishDate: r.publish_date || r.published_at || r.date_posted,
      status: r.status || "Draft",
      priority: r.priority || "Medium",
      views: r.views || 0,
      attachments: (attachmentsMap[r.announcement_id] || []).map((att) => ({
        id: att.attachment_id,
        fileName: att.file_name,
        fileType: att.file_type,
        fileSize: att.file_size,
        fileUrl: att.file_url,
        uploadedAt: att.uploaded_at,
      })),
      lastUpdated: r.date_updated || r.date_posted,
      isArchived: Boolean(r.is_archived),
      audience: r.audience || "public",
      // User interaction state
      isRead: Boolean(r.is_read),
      isHidden: Boolean(r.is_hidden),
      readAt: r.read_at,
      hiddenAt: r.hidden_at,
    }));

    res.json({ data });
  } catch (error) {
    console.error("Error fetching user announcements:", error);
    res.status(500).json({
      error: true,
      message: "Failed to fetch announcements",
      details: error.message,
    });
  }
});

/**
 * GET /api/user-announcements/:userId/stats
 * Get user's announcement statistics (unread count, etc.)
 */
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get counts
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

    console.log("[Stats Debug] Raw stats:", stats[0]);

    const result = {
      total: Number(stats[0]?.total || 0),
      unread: Number(stats[0]?.unread || 0),
      read: Number(stats[0]?.read || 0),
      hidden: Number(stats[0]?.hidden || 0),
    };

    console.log("[Stats Debug] Processed result:", result);

    res.json({ data: result });
  } catch (error) {
    console.error("Error fetching announcement stats:", error);
    res.status(500).json({
      error: true,
      message: "Failed to fetch statistics",
    });
  }
});

/**
 * POST /api/user-announcements/:userId/mark-read
 * Mark announcement(s) as read
 */
router.post("/:userId/mark-read", async (req, res) => {
  try {
    const { userId } = req.params;
    const { announcementId, announcementIds } = req.body;

    const ids = announcementIds || [announcementId];

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        error: true,
        message: "announcementId or announcementIds required",
      });
    }

    // Insert or update interaction records
    for (const id of ids) {
      await pool.query(
        `INSERT INTO user_announcement_interaction 
         (user_id, announcement_id, is_read, read_at) 
         VALUES (?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE 
         is_read = 1, 
         read_at = NOW()`,
        [userId, id]
      );
    }

    res.json({
      success: true,
      message: `Marked ${ids.length} announcement(s) as read`,
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      error: true,
      message: "Failed to mark as read",
      details: error.message,
    });
  }
});

/**
 * POST /api/user-announcements/:userId/mark-unread
 * Mark announcement as unread
 */
router.post("/:userId/mark-unread", async (req, res) => {
  try {
    const { userId } = req.params;
    const { announcementId } = req.body;

    if (!announcementId) {
      return res.status(400).json({
        error: true,
        message: "announcementId required",
      });
    }

    await pool.query(
      `INSERT INTO user_announcement_interaction 
       (user_id, announcement_id, is_read, read_at) 
       VALUES (?, ?, 0, NULL)
       ON DUPLICATE KEY UPDATE 
       is_read = 0, 
       read_at = NULL`,
      [userId, announcementId]
    );

    res.json({
      success: true,
      message: "Marked as unread",
    });
  } catch (error) {
    console.error("Error marking as unread:", error);
    res.status(500).json({
      error: true,
      message: "Failed to mark as unread",
    });
  }
});

/**
 * POST /api/user-announcements/:userId/hide
 * Hide announcement from user's view
 */
router.post("/:userId/hide", async (req, res) => {
  try {
    const { userId } = req.params;
    const { announcementId } = req.body;

    if (!announcementId) {
      return res.status(400).json({
        error: true,
        message: "announcementId required",
      });
    }

    await pool.query(
      `INSERT INTO user_announcement_interaction 
       (user_id, announcement_id, is_hidden, hidden_at) 
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE 
       is_hidden = 1, 
       hidden_at = NOW()`,
      [userId, announcementId]
    );

    res.json({
      success: true,
      message: "Announcement hidden",
    });
  } catch (error) {
    console.error("Error hiding announcement:", error);
    res.status(500).json({
      error: true,
      message: "Failed to hide announcement",
    });
  }
});

/**
 * POST /api/user-announcements/:userId/unhide
 * Unhide announcement
 */
router.post("/:userId/unhide", async (req, res) => {
  try {
    const { userId } = req.params;
    const { announcementId } = req.body;

    if (!announcementId) {
      return res.status(400).json({
        error: true,
        message: "announcementId required",
      });
    }

    await pool.query(
      `INSERT INTO user_announcement_interaction 
       (user_id, announcement_id, is_hidden, hidden_at) 
       VALUES (?, ?, 0, NULL)
       ON DUPLICATE KEY UPDATE 
       is_hidden = 0, 
       hidden_at = NULL`,
      [userId, announcementId]
    );

    res.json({
      success: true,
      message: "Announcement unhidden",
    });
  } catch (error) {
    console.error("Error unhiding announcement:", error);
    res.status(500).json({
      error: true,
      message: "Failed to unhide announcement",
    });
  }
});

/**
 * POST /api/user-announcements/:userId/mark-all-read
 * Mark all announcements as read for user
 */
router.post("/:userId/mark-all-read", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all published announcement IDs
    const [announcements] = await pool.query(
      "SELECT announcement_id FROM announcement WHERE status = 'Published'"
    );

    // Mark all as read
    for (const announcement of announcements) {
      await pool.query(
        `INSERT INTO user_announcement_interaction 
         (user_id, announcement_id, is_read, read_at) 
         VALUES (?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE 
         is_read = 1, 
         read_at = NOW()`,
        [userId, announcement.announcement_id]
      );
    }

    res.json({
      success: true,
      message: `Marked ${announcements.length} announcements as read`,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      error: true,
      message: "Failed to mark all as read",
    });
  }
});

export default router;
