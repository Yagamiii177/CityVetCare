const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const parseJsonField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) || [];
    } catch (err) {
      console.warn("Failed to parse JSON field", err);
      return [];
    }
  }
  return [];
};

const normalizeMaterial = (material) => ({
  ...material,
  tags: parseJsonField(material?.tags),
  images: parseJsonField(material?.images),
});

// Reading Materials API Service
export const readingMaterialService = {
  // Get all materials
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-materials`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reading materials");
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(normalizeMaterial) : [];
    } catch (error) {
      console.error("Error fetching reading materials:", error);
      throw error;
    }
  },

  // Get single material by ID
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-materials/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reading material");
      }

      const material = await response.json();
      return normalizeMaterial(material);
    } catch (error) {
      console.error("Error fetching reading material:", error);
      throw error;
    }
  },

  // Create new material
  async create(materialData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        throw new Error("Failed to create reading material");
      }

      const created = await response.json();
      return normalizeMaterial(created);
    } catch (error) {
      console.error("Error creating reading material:", error);
      throw error;
    }
  },

  // Update existing material
  async update(id, materialData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-materials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        throw new Error("Failed to update reading material");
      }

      const updated = await response.json();
      return normalizeMaterial(updated);
    } catch (error) {
      console.error("Error updating reading material:", error);
      throw error;
    }
  },

  // Delete material
  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-materials/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reading material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting reading material:", error);
      throw error;
    }
  },

  // Archive material
  async archive(id, reason = "Manual archive") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reading-materials/${id}/archive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to archive reading material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error archiving reading material:", error);
      throw error;
    }
  },

  // Restore from archive
  async restore(id) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reading-materials/${id}/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to restore reading material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error restoring reading material:", error);
      throw error;
    }
  },

  // Update status (publish/draft)
  async updateStatus(id, status) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reading-materials/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update material status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating material status:", error);
      throw error;
    }
  },

  // Bulk archive
  async bulkArchive(ids, reason = "Bulk archive") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reading-materials/bulk/archive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ids, reason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to bulk archive materials");
      }

      return await response.json();
    } catch (error) {
      console.error("Error bulk archiving materials:", error);
      throw error;
    }
  },

  // Bulk publish
  async bulkPublish(ids) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reading-materials/bulk/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to bulk publish materials");
      }

      return await response.json();
    } catch (error) {
      console.error("Error bulk publishing materials:", error);
      throw error;
    }
  },

  // Get archive history
  async getArchiveHistory() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reading-materials/archive-history`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch archive history");
      }
      const data = await response.json();

      // Normalize field names (material_id -> materialId) for frontend usage
      return data.map((record) => ({
        ...record,
        materialId: record.materialId ?? record.material_id,
      }));
    } catch (error) {
      console.error("Error fetching archive history:", error);
      throw error;
    }
  },

  // Upload image
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_BASE_URL}/reading-materials/upload-image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },
};
