import express from "express";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const logger = new Logger("NOTIFICATIONS_ROUTES");

function mapUserType(userType) {
  if (userType === "pet_owner") return "owner";
  if (userType === "admin") return "admin";
  if (userType === "dog_catcher") return "catcher";
  return "owner";
}

async function ensureNotificationsTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('owner', 'admin', 'catcher') NOT NULL DEFAULT 'owner',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    stray_animal_id INT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_notifications (user_id, user_type),
    INDEX idx_notification_read (is_read),
    INDEX idx_stray_notification (stray_animal_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

// GET /api/notifications - list notifications for current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    await ensureNotificationsTable();
    const userId = req.user?.id;
    const userType = mapUserType(req.user?.userType);

    const [rows] = await pool.query(
      `SELECT 
         n.notification_id AS id,
         n.title,
         n.message,
         n.type,
         n.is_read,
         n.created_at,
         n.stray_animal_id,
         sa.animal_id,
         sa.name as stray_name,
         sa.species,
         sa.breed,
         sa.sex,
         sa.color,
         sa.markings,
         sa.images,
         sa.rfid,
         sa.status,
         sa.date_captured,
         sa.location_captured
       FROM notifications n
       LEFT JOIN stray_animals sa ON n.stray_animal_id = sa.animal_id
       WHERE n.user_id = ? AND n.user_type = ?
       ORDER BY n.created_at DESC`,
      [userId, userType]
    );

    // Transform the notifications to include pet data
    const transformedNotifications = rows.map((row) => {
      const notification = {
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        is_read: row.is_read,
        created_at: row.created_at,
      };

      // If there's stray animal data, include it
      if (row.stray_animal_id && row.animal_id) {
        const normalizeImages = (images) => {
          if (!images) return [];
          if (typeof images === "string") {
            try {
              const parsed = JSON.parse(images);
              if (Array.isArray(parsed)) return parsed.filter(Boolean);
              if (typeof parsed === "object")
                return Object.values(parsed).filter(Boolean);
            } catch (e) {
              return [];
            }
          }
          if (typeof images === "object")
            return Object.values(images).filter(Boolean);
          return [];
        };

        notification.stray_animal = {
          id: row.animal_id.toString(),
          name: row.stray_name || `Stray #${row.animal_id}`,
          species: row.species,
          breed: row.breed || "Mixed Breed",
          sex: row.sex || "Unknown",
          color: row.color || "",
          markings: row.markings || "",
          locationCaptured: row.location_captured || "",
          imageUrls: normalizeImages(row.images),
          capturedDate: row.date_captured,
          status: row.status || "captured",
          type: (row.species || "dog").toLowerCase(),
          rfid: row.rfid || null,
        };
      }

      return notification;
    });

    res.json({ success: true, notifications: transformedNotifications });
  } catch (error) {
    logger.error("Failed to list notifications", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to fetch notifications" });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    await ensureNotificationsTable();
    const userId = req.user?.id;
    const userType = mapUserType(req.user?.userType);

    const [rows] = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND user_type = ? AND is_read = 0`,
      [userId, userType]
    );

    res.json({ success: true, unread: rows[0]?.unread || 0 });
  } catch (error) {
    logger.error("Failed to get unread count", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to fetch unread count" });
  }
});

// PUT /api/notifications/:id/read - mark single notification as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    await ensureNotificationsTable();
    const userId = req.user?.id;
    const userType = mapUserType(req.user?.userType);
    const id = req.params.id;

    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ? AND user_type = ?`,
      [id, userId, userType]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Notification not found" });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to mark notification as read", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to update notification" });
  }
});

// PUT /api/notifications/read-all - mark all as read
router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    await ensureNotificationsTable();
    const userId = req.user?.id;
    const userType = mapUserType(req.user?.userType);

    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_type = ?`,
      [userId, userType]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to mark all as read", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to update notifications" });
  }
});

// DELETE /api/notifications/:id - delete a notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await ensureNotificationsTable();
    const userId = req.user?.id;
    const userType = mapUserType(req.user?.userType);
    const id = req.params.id;

    const [result] = await pool.query(
      `DELETE FROM notifications WHERE notification_id = ? AND user_id = ? AND user_type = ?`,
      [id, userId, userType]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Notification not found" });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete notification", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to delete notification" });
  }
});

export default router;

// Admin: Create notification for a specific user
// POST /api/notifications/admin
router.post("/admin", authenticateToken, async (req, res) => {
  try {
    await ensureNotificationsTable();

    const { userId, userType, title, message, type } = req.body;

    if (!userId || !title || !message || !type) {
      return res.status(400).json({
        error: true,
        message: "userId, title, message, and type are required",
      });
    }

    const normalizedUserType = ["owner", "admin", "catcher"].includes(
      (userType || "owner").toLowerCase()
    )
      ? (userType || "owner").toLowerCase()
      : "owner";

    await pool.query(
      `INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (?, ?, ?, ?, ?)`,
      [userId, normalizedUserType, title, message, type]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to create admin notification", error);
    res
      .status(500)
      .json({ error: true, message: "Unable to create notification" });
  }
});
