/**
 * API Configuration for CityVetCare Mobile App
 *
 * This file centralizes all API endpoints and configuration.
 * Update API_BASE_URL based on your environment:
 * - Development (local): Use your computer's IP address
 * - Production: Use your server's domain
 */

// IMPORTANT: Update based on your testing environment
// - Android Emulator: Use 10.0.2.2:3000
// - iOS Simulator: Use localhost:3000
// - Physical Device: Use your computer's IP address
// To find your IP: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) in terminal

// Node.js Backend Configuration (port 3000)
// const API_BASE_URL = "http://10.0.2.2:3000"; // For Android emulator

// For iOS Simulator: Uncomment line below
// const API_BASE_URL = "http://localhost:3000";

import { getApiBaseUrl } from "./api-helper";

// Keep this legacy config in sync with api-config.js
// api-helper returns a URL that ends with `/api`; this file expects the host-only base.
const API_BASE_URL = getApiBaseUrl().replace(/\/api\/?$/, "");

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Report Management
  incidents: {
    getAll: `${API_BASE_URL}/api/incidents`,
    getById: (id) => `${API_BASE_URL}/api/incidents/${id}`,
    create: `${API_BASE_URL}/api/incidents`,
    update: (id) => `${API_BASE_URL}/api/incidents/${id}`,
    delete: (id) => `${API_BASE_URL}/api/incidents/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/api/incidents/${id}/status`,
  },

  // Notifications
  notifications: {
    getAll: `${API_BASE_URL}/api/notifications`,
    markRead: `${API_BASE_URL}/api/notifications`,
    delete: `${API_BASE_URL}/api/notifications`,
  },

  // Dashboard
  dashboard: {
    stats: `${API_BASE_URL}/api/dashboard/stats`,
    recentReports: `${API_BASE_URL}/api/dashboard/recent-reports`,
  },

  // Catcher Teams
  catchers: {
    getAll: `${API_BASE_URL}/api/catchers`,
    getById: (id) => `${API_BASE_URL}/api/catchers/${id}`,
    schedule: `${API_BASE_URL}/api/catchers/schedule`,
  },

  // Authentication (if needed in future)
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },

  // Reading Materials (User-side view only)
  READING_MATERIALS: {
    LIST: `${API_BASE_URL}/api/reading-materials`,
    DETAIL: (id) => `${API_BASE_URL}/api/reading-materials/${id}`,
  },

  // Announcements (User-side view only)
  ANNOUNCEMENTS: {
    LIST: `${API_BASE_URL}/api/announcements`,
    DETAIL: (id) => `${API_BASE_URL}/api/announcements/${id}`,
  },

  // Clinics (Veterinary Clinics)
  clinics: {
    getAll: `${API_BASE_URL}/api/clinics`,
    getLocations: `${API_BASE_URL}/api/clinics/locations`,
    getById: (id) => `${API_BASE_URL}/api/clinics/${id}`,
    getNearby: (lat, lng, radius) =>
      `${API_BASE_URL}/api/clinic-map/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
  },

  // Health Check
  health: `${API_BASE_URL}/api/health`,
};

/**
 * Status mapping for reports (aligned with backend)
 */
export const REPORT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  SCHEDULED_FOR_PATROL: "scheduled_for_patrol",
};

/**
 * Status labels for UI display
 */
export const STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: "Pending",
  [REPORT_STATUS.APPROVED]: "Approved",
  [REPORT_STATUS.IN_PROGRESS]: "In Progress",
  [REPORT_STATUS.RESOLVED]: "Resolved",
  [REPORT_STATUS.REJECTED]: "Rejected",
  [REPORT_STATUS.SCHEDULED_FOR_PATROL]: "Scheduled for Patrol",
};

/**
 * Status colors for UI (aligned with backend statuses)
 */
export const STATUS_COLORS = {
  [REPORT_STATUS.PENDING]: "#FD7E14", // Orange
  [REPORT_STATUS.APPROVED]: "#0d6efd", // Blue
  [REPORT_STATUS.IN_PROGRESS]: "#3498db", // Light Blue
  [REPORT_STATUS.RESOLVED]: "#2ecc71", // Green
  [REPORT_STATUS.REJECTED]: "#dc3545", // Red
  [REPORT_STATUS.SCHEDULED_FOR_PATROL]: "#17a2b8", // Teal
};

export default API_CONFIG;
