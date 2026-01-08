import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { pool } from "../config/database.js";

const router = express.Router();

// Resolve local directory (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration for image uploads
const uploadDir = path.join(__dirname, "..", "uploads", "reading-materials");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path.basename(file.originalname, ext) || "image";
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

// GET all reading materials
router.get("/", async (req, res) => {
  try {
    const [materials] = await pool.query(
      "SELECT * FROM reading_materials ORDER BY date_created DESC"
    );

    // Parse JSON fields
    const parsedMaterials = materials.map((material) => ({
      ...material,
      tags:
        typeof material.tags === "string"
          ? JSON.parse(material.tags)
          : material.tags,
      images:
        typeof material.images === "string"
          ? JSON.parse(material.images)
          : material.images,
    }));

    res.json(parsedMaterials);
  } catch (error) {
    console.error("Error fetching reading materials:", error);
    res.status(500).json({ error: "Failed to fetch reading materials" });
  }
});

// GET archive history (MUST be before /:id route)
router.get("/archive-history", async (req, res) => {
  try {
    const [history] = await pool.query(
      "SELECT * FROM archive_history ORDER BY archived_date DESC"
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching archive history:", error);
    res.status(500).json({ error: "Failed to fetch archive history" });
  }
});

// PUT update reading material
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [materials] = await pool.query(
      "SELECT * FROM reading_materials WHERE id = ?",
      [id]
    );

    if (materials.length === 0) {
      return res.status(404).json({ error: "Reading material not found" });
    }

    const material = materials[0];
    const parsedMaterial = {
      ...material,
      tags:
        typeof material.tags === "string"
          ? JSON.parse(material.tags)
          : material.tags,
      images:
        typeof material.images === "string"
          ? JSON.parse(material.images)
          : material.images,
    };

    res.json(parsedMaterial);
  } catch (error) {
    console.error("Error fetching reading material:", error);
    res.status(500).json({ error: "Failed to fetch reading material" });
  }
});

// POST create new reading material
router.post("/", async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      author,
      description,
      content,
      url,
      status,
      tags,
      images,
    } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({ error: "Title and type are required" });
    }

    const dateAdded = new Date().toISOString().split("T")[0];

    const [result] = await pool.query(
      `INSERT INTO reading_materials 
       (title, type, category, author, description, content, url, status, tags, images, date_added, views) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        type,
        category || null,
        author || null,
        description || null,
        content || null,
        url || null,
        status || "draft",
        JSON.stringify(tags || []),
        JSON.stringify(images || []),
        dateAdded,
        0,
      ]
    );

    const [newMaterial] = await pool.query(
      "SELECT * FROM reading_materials WHERE id = ?",
      [result.insertId]
    );

    const material = newMaterial[0];
    const parsedMaterial = {
      ...material,
      tags:
        typeof material.tags === "string"
          ? JSON.parse(material.tags)
          : material.tags,
      images:
        typeof material.images === "string"
          ? JSON.parse(material.images)
          : material.images,
    };

    res.status(201).json(parsedMaterial);
  } catch (error) {
    console.error("Error creating reading material:", error);
    res.status(500).json({ error: "Failed to create reading material" });
  }
});

// POST archive material (MUST be before /:id route)
router.post("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get current material
    const [materials] = await pool.query(
      "SELECT * FROM reading_materials WHERE id = ?",
      [id]
    );

    if (materials.length === 0) {
      return res.status(404).json({ error: "Reading material not found" });
    }

    const material = materials[0];
    const archivedDate = new Date().toISOString().split("T")[0];

    // Update material status to archived
    await pool.query(
      "UPDATE reading_materials SET status = 'archived' WHERE id = ?",
      [id]
    );

    // Add to archive history
    const [archiveResult] = await pool.query(
      `INSERT INTO archive_history 
       (material_id, title, archived_by, archived_date, reason, previous_status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        material.title,
        req.user?.name || "Admin",
        archivedDate,
        reason || "Manual archive",
        material.status,
      ]
    );

    const archiveRecord = {
      id: archiveResult.insertId,
      materialId: id,
      title: material.title,
      archivedBy: req.user?.name || "Admin",
      archivedDate,
      reason: reason || "Manual archive",
      previousStatus: material.status,
    };

    res.json({ message: "Material archived successfully", archiveRecord });
  } catch (error) {
    console.error("Error archiving reading material:", error);
    res.status(500).json({ error: "Failed to archive reading material" });
  }
});

// POST restore from archive (MUST be before /:id route)
router.post("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    // Get archive record to find previous status
    const [archiveRecords] = await pool.query(
      "SELECT * FROM archive_history WHERE material_id = ? ORDER BY date_created DESC LIMIT 1",
      [id]
    );

    if (archiveRecords.length === 0) {
      return res.status(404).json({ error: "Archive record not found" });
    }

    const previousStatus = archiveRecords[0].previous_status;

    // Restore material status
    await pool.query("UPDATE reading_materials SET status = ? WHERE id = ?", [
      previousStatus,
      id,
    ]);

    // Remove from archive history
    await pool.query("DELETE FROM archive_history WHERE material_id = ?", [id]);

    res.json({ message: "Material restored successfully" });
  } catch (error) {
    console.error("Error restoring reading material:", error);
    res.status(500).json({ error: "Failed to restore reading material" });
  }
});

// PATCH update material status (MUST be before /:id route)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!["published", "draft", "archived"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Update in database
    await pool.query("UPDATE reading_materials SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({ id, status });
  } catch (error) {
    console.error("Error updating material status:", error);
    res.status(500).json({ error: "Failed to update material status" });
  }
});

// GET single reading material by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      category,
      author,
      description,
      content,
      url,
      status,
      tags,
      images,
    } = req.body;

    await pool.query(
      `UPDATE reading_materials 
       SET title = ?, type = ?, category = ?, author = ?, description = ?, 
           content = ?, url = ?, status = ?, tags = ?, images = ?
       WHERE id = ?`,
      [
        title,
        type,
        category || null,
        author || null,
        description || null,
        content || null,
        url || null,
        status,
        JSON.stringify(tags || []),
        JSON.stringify(images || []),
        id,
      ]
    );

    const [updatedMaterial] = await pool.query(
      "SELECT * FROM reading_materials WHERE id = ?",
      [id]
    );

    if (updatedMaterial.length === 0) {
      return res.status(404).json({ error: "Reading material not found" });
    }

    const material = updatedMaterial[0];
    const parsedMaterial = {
      ...material,
      tags:
        typeof material.tags === "string"
          ? JSON.parse(material.tags)
          : material.tags,
      images:
        typeof material.images === "string"
          ? JSON.parse(material.images)
          : material.images,
    };

    res.json(parsedMaterial);
  } catch (error) {
    console.error("Error updating reading material:", error);
    res.status(500).json({ error: "Failed to update reading material" });
  }
});

// DELETE reading material
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM reading_materials WHERE id = ?", [id]);

    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting reading material:", error);
    res.status(500).json({ error: "Failed to delete reading material" });
  }
});
router.post("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get current material
    const [materials] = await pool.query(
      "SELECT * FROM reading_materials WHERE id = ?",
      [id]
    );

    if (materials.length === 0) {
      return res.status(404).json({ error: "Reading material not found" });
    }

    const material = materials[0];
    const archivedDate = new Date().toISOString().split("T")[0];

    // Update material status to archived
    await pool.query(
      "UPDATE reading_materials SET status = 'archived' WHERE id = ?",
      [id]
    );

    // Add to archive history
    const [archiveResult] = await pool.query(
      `INSERT INTO archive_history 
       (material_id, title, archived_by, archived_date, reason, previous_status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        material.title,
        req.user?.name || "Admin",
        archivedDate,
        reason || "Manual archive",
        material.status,
      ]
    );

    const archiveRecord = {
      id: archiveResult.insertId,
      materialId: id,
      title: material.title,
      archivedBy: req.user?.name || "Admin",
      archivedDate,
      reason: reason || "Manual archive",
      previousStatus: material.status,
    };

    res.json({ message: "Material archived successfully", archiveRecord });
  } catch (error) {
    console.error("Error archiving reading material:", error);
    res.status(500).json({ error: "Failed to archive reading material" });
  }
});

// POST restore from archive
router.post("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    // Get archive record to find previous status
    const [archiveRecords] = await pool.query(
      "SELECT * FROM archive_history WHERE material_id = ? ORDER BY date_created DESC LIMIT 1",
      [id]
    );

    if (archiveRecords.length === 0) {
      return res.status(404).json({ error: "Archive record not found" });
    }

    const previousStatus = archiveRecords[0].previous_status;

    // Restore material status
    await pool.query("UPDATE reading_materials SET status = ? WHERE id = ?", [
      previousStatus,
      id,
    ]);

    // Remove from archive history
    await pool.query("DELETE FROM archive_history WHERE material_id = ?", [id]);

    res.json({ message: "Material restored successfully" });
  } catch (error) {
    console.error("Error restoring reading material:", error);
    res.status(500).json({ error: "Failed to restore reading material" });
  }
});

// PATCH update material status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!["published", "draft", "archived"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Update in database
    await pool.query("UPDATE reading_materials SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({ id, status });
  } catch (error) {
    console.error("Error updating material status:", error);
    res.status(500).json({ error: "Failed to update material status" });
  }
});

// POST bulk archive
router.post("/bulk/archive", async (req, res) => {
  try {
    const { ids, reason } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid IDs array" });
    }

    // Get materials to archive
    const [materials] = await pool.query(
      "SELECT * FROM reading_materials WHERE id IN (?)",
      [ids]
    );

    if (materials.length === 0) {
      return res.status(404).json({ error: "No materials found" });
    }

    const archivedDate = new Date().toISOString().split("T")[0];

    // Create archive records
    for (const material of materials) {
      await pool.query(
        `INSERT INTO archive_history 
         (material_id, title, archived_by, archived_date, reason, previous_status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          material.id,
          material.title,
          req.user?.name || "Admin",
          archivedDate,
          reason || "Bulk archive",
          material.status,
        ]
      );
    }

    // Update materials
    await pool.query(
      "UPDATE reading_materials SET status = 'archived' WHERE id IN (?)",
      [ids]
    );

    res.json({ message: "Materials archived successfully", count: ids.length });
  } catch (error) {
    console.error("Error bulk archiving materials:", error);
    res.status(500).json({ error: "Failed to bulk archive materials" });
  }
});

// POST bulk publish
router.post("/bulk/publish", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid IDs array" });
    }

    // Update materials
    await pool.query(
      "UPDATE reading_materials SET status = 'published' WHERE id IN (?)",
      [ids]
    );

    res.json({
      message: "Materials published successfully",
      count: ids.length,
    });
  } catch (error) {
    console.error("Error bulk publishing materials:", error);
    res.status(500).json({ error: "Failed to bulk publish materials" });
  }
});

// GET archive history
router.get("/archive-history", async (req, res) => {
  try {
    const [history] = await pool.query(
      "SELECT * FROM archive_history ORDER BY archived_date DESC"
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching archive history:", error);
    res.status(500).json({ error: "Failed to fetch archive history" });
  }
});

// POST upload image
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/reading-materials/${req.file.filename}`;

    res.json({
      id: req.file.filename,
      url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      isCover: false,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
