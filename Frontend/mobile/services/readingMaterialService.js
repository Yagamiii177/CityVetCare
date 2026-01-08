/**
 * Reading Material Service for Mobile App
 * Handles all reading material API calls for user-side viewing
 */

import { API_ENDPOINTS } from "../config/api";

/**
 * Fetch all published reading materials (for mobile users)
 */
export const getPublishedReadingMaterials = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.READING_MATERIALS.LIST, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const materials = await response.json();

    // Filter only published materials for mobile users
    const publishedMaterials = Array.isArray(materials)
      ? materials.filter((m) => m.status === "published")
      : [];

    return publishedMaterials.map(normalizeMaterial);
  } catch (error) {
    console.error("Error fetching reading materials:", error);
    throw error;
  }
};

/**
 * Fetch a single reading material by ID
 */
export const getReadingMaterialById = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.READING_MATERIALS.DETAIL(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const material = await response.json();
    return normalizeMaterial(material);
  } catch (error) {
    console.error("Error fetching reading material:", error);
    throw error;
  }
};

/**
 * Normalize material data (parse JSON fields)
 */
const normalizeMaterial = (material) => {
  const parsedImages = parseJsonField(material?.images);
  const hasCover = parsedImages.some((img) => img?.isCover);
  const normalizedImages = hasCover
    ? parsedImages
    : parsedImages.map((img, index) =>
        index === 0 ? { ...img, isCover: true } : img
      );

  return {
    ...material,
    tags: parseJsonField(material?.tags),
    images: normalizedImages,
  };
};

/**
 * Parse JSON field safely
 */
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

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If already a full URL, replace localhost with correct base URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // Replace localhost URLs with the configured API base URL
    const baseUrl = API_ENDPOINTS.READING_MATERIALS.LIST.replace(
      "/api/reading-materials",
      ""
    );

    // Replace any localhost references with the correct IP/domain
    return imagePath
      .replace("http://localhost:3000", baseUrl)
      .replace("http://127.0.0.1:3000", baseUrl)
      .replace("http://10.0.2.2:3000", baseUrl);
  }

  // Remove /api from base URL for static file serving
  const baseUrl = API_ENDPOINTS.READING_MATERIALS.LIST.replace(
    "/api/reading-materials",
    ""
  );

  // Return full URL
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

/**
 * Filter materials by type
 */
export const filterByType = (materials, type) => {
  if (type === "all") return materials;
  return materials.filter((m) => m.type === type);
};

/**
 * Filter materials by category
 */
export const filterByCategory = (materials, category) => {
  if (!category) return materials;
  return materials.filter(
    (m) => m.category && m.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Search materials by keyword
 */
export const searchMaterials = (materials, keyword) => {
  if (!keyword) return materials;

  const lowerKeyword = keyword.toLowerCase();
  return materials.filter(
    (m) =>
      m.title?.toLowerCase().includes(lowerKeyword) ||
      m.description?.toLowerCase().includes(lowerKeyword) ||
      m.author?.toLowerCase().includes(lowerKeyword) ||
      m.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword))
  );
};

/**
 * Get material type icon/emoji
 */
export const getMaterialTypeIcon = (type) => {
  const icons = {
    book: "📚",
    website: "🌐",
    digital: "💻",
    article: "📄",
    video: "🎥",
    podcast: "🎧",
  };
  return icons[type] || "📖";
};

/**
 * Get material type label
 */
export const getMaterialTypeLabel = (type) => {
  const labels = {
    book: "Book",
    website: "Website",
    digital: "Digital Content",
    article: "Article",
    video: "Video",
    podcast: "Podcast",
  };
  return labels[type] || "Material";
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

/**
 * Get reading time estimate (words per minute)
 */
export const getReadingTime = (content) => {
  if (!content) return 0;

  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return minutes;
};

/**
 * Categorize materials by type
 */
export const categorizeByType = (materials) => {
  const categories = {
    book: [],
    website: [],
    digital: [],
    article: [],
    video: [],
    podcast: [],
    other: [],
  };

  materials.forEach((material) => {
    const type = material.type || "other";
    if (categories[type]) {
      categories[type].push(material);
    } else {
      categories.other.push(material);
    }
  });

  return categories;
};

export default {
  getPublishedReadingMaterials,
  getReadingMaterialById,
  getImageUrl,
  filterByType,
  filterByCategory,
  searchMaterials,
  getMaterialTypeIcon,
  getMaterialTypeLabel,
  formatDate,
  getReadingTime,
  categorizeByType,
};
