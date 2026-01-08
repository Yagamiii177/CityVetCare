/**
 * Announcement Service for Mobile App
 * Handles all announcement-related API calls
 */

import { API_ENDPOINTS } from "../config/api-config";

const normalizeAttachments = (attachments = []) =>
  attachments.map((att) => ({
    ...att,
    fileUrl: att.fileUrl || att.url, // support either key from backend/admin
    url: att.url || att.fileUrl,
  }));

const normalizeAnnouncement = (announcement = {}) => ({
  ...announcement,
  attachments: normalizeAttachments(announcement.attachments || []),
});

/**
 * Fetch all published announcements (for mobile users)
 */
export const getPublishedAnnouncements = async () => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.ANNOUNCEMENTS.LIST}?status=Published`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return (result.data || []).map(normalizeAnnouncement);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

/**
 * Fetch a single announcement by ID
 */
export const getAnnouncementById = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.DETAIL(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return normalizeAnnouncement(result.data);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    throw error;
  }
};

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Remove /api from base URL for static file serving
  const baseUrl = API_ENDPOINTS.ANNOUNCEMENTS.LIST.replace(
    "/api/announcements",
    ""
  );

  // Return full URL
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

/**
 * Categorize announcements by category
 */
export const categorizeByCategory = (announcements) => {
  const categories = {
    health: [],
    policy: [],
    events: [],
    general: [],
  };

  announcements.forEach((announcement) => {
    const category = announcement.category || "general";
    if (categories[category]) {
      categories[category].push(announcement);
    } else {
      categories.general.push(announcement);
    }
  });

  return categories;
};

/**
 * Categorize announcements by date (Today, Yesterday, Past)
 */
export const categorizeByDate = (announcements) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayPosts = [];
  const yesterdayPosts = [];
  const pastPosts = [];

  announcements.forEach((announcement) => {
    const postDate = new Date(
      announcement.publishDate || announcement.date_posted
    );
    postDate.setHours(0, 0, 0, 0);

    if (postDate.getTime() === today.getTime()) {
      todayPosts.push(announcement);
    } else if (postDate.getTime() === yesterday.getTime()) {
      yesterdayPosts.push(announcement);
    } else {
      pastPosts.push(announcement);
    }
  });

  return { todayPosts, yesterdayPosts, pastPosts };
};

/**
 * Get category icon name
 */
export const getCategoryIcon = (category) => {
  const icons = {
    health: "medical",
    policy: "document-text",
    events: "calendar",
    general: "information-circle",
  };
  return icons[category] || icons.general;
};

/**
 * Get category color
 */
export const getCategoryColor = (category) => {
  const colors = {
    health: "#dc3545",
    policy: "#0d6efd",
    events: "#28a745",
    general: "#6c757d",
  };
  return colors[category] || colors.general;
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    High: "#dc3545",
    Medium: "#ffc107",
    Low: "#28a745",
  };
  return colors[priority] || colors.Medium;
};

/**
 * USER-SPECIFIC ANNOUNCEMENT METHODS
 */

/**
 * Get announcements with user's read/unread state
 */
export const getUserAnnouncements = async (userId, filters = {}) => {
  try {
    const { filter, search, status } = filters;
    const params = new URLSearchParams();

    if (filter) params.append("filter", filter);
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const url = `${API_ENDPOINTS.USER_ANNOUNCEMENTS.LIST(userId)}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return (result.data || []).map(normalizeAnnouncement);
  } catch (error) {
    console.error("Error fetching user announcements:", error);
    throw error;
  }
};

/**
 * Get announcement statistics for user
 */
export const getUserAnnouncementStats = async (userId) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.USER_ANNOUNCEMENTS.STATS(userId),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching announcement stats:", error);
    throw error;
  }
};

/**
 * Mark announcement as read
 */
export const markAnnouncementAsRead = async (userId, announcementId) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.USER_ANNOUNCEMENTS.MARK_READ(userId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    throw error;
  }
};

/**
 * Mark announcement as unread
 */
export const markAnnouncementAsUnread = async (userId, announcementId) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.USER_ANNOUNCEMENTS.MARK_UNREAD(userId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking announcement as unread:", error);
    throw error;
  }
};

/**
 * Hide announcement from user's view
 */
export const hideAnnouncement = async (userId, announcementId) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.USER_ANNOUNCEMENTS.HIDE(userId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error hiding announcement:", error);
    throw error;
  }
};

/**
 * Unhide announcement
 */
export const unhideAnnouncement = async (userId, announcementId) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.USER_ANNOUNCEMENTS.UNHIDE(userId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error unhiding announcement:", error);
    throw error;
  }
};

/**
 * Mark all announcements as read
 */
export const markAllAnnouncementsAsRead = async (userId) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.USER_ANNOUNCEMENTS.MARK_ALL_READ(userId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

export default {
  getPublishedAnnouncements,
  getAnnouncementById,
  getImageUrl,
  categorizeByCategory,
  categorizeByDate,
  getCategoryIcon,
  getCategoryColor,
  getPriorityColor,
  // User-specific methods
  getUserAnnouncements,
  getUserAnnouncementStats,
  markAnnouncementAsRead,
  markAnnouncementAsUnread,
  hideAnnouncement,
  unhideAnnouncement,
  markAllAnnouncementsAsRead,
};
