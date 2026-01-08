/**
 * API Configuration for CityVetCare Mobile App
 * Connects to Node.js/Express Backend
 *
 * IMPORTANT: Update API_BASE_URL for your environment:
 * - Android Emulator: Use 10.0.2.2:3000
 * - iOS Simulator: Use localhost:3000
 * - Physical Device: Use your computer's IP address (find with ipconfig/ifconfig)
 */

import { Platform } from "react-native";

// ============================================
// 🔧 CONFIGURATION GUIDE
// ============================================
//
// Are you testing on a PHYSICAL DEVICE (real phone/tablet)?
// 1. IP address is already configured below
// 2. Make sure your phone and PC are on the SAME WiFi
// 3. Your PC's IP is: 192.168.1.45 (UPDATED: Jan 6, 2026)
//
// Are you using Android Emulator?
// - No changes needed! Default works.
//
// Are you using iOS Simulator?
// - No changes needed! Auto-detected.
// ============================================

// Auto-detect the best API URL based on platform
const getApiBaseUrl = () => {
  // 🔥 FOR PHYSICAL DEVICE (iPhone/Android): Use PC's IP address
  // Make sure your phone and PC are on the SAME WiFi network!
  return "http://192.168.1.45:3000/api";

  // UNCOMMENT FOR EMULATOR/SIMULATOR TESTING:
  // For Android Emulator:
  // if (Platform.OS === 'android') {
  //   return 'http://10.0.2.2:3000/api';
  // }

  // For iOS Simulator:
  // if (Platform.OS === 'ios') {
  //   return 'http://localhost:3000/api';
  // }
};

const API_BASE_URL = getApiBaseUrl();

console.log("🌐 CityVetCare API Base URL:", API_BASE_URL);
console.log("📱 Platform:", Platform.OS);

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes for image uploads
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },

  // Incidents
  INCIDENTS: {
    LIST: `${API_BASE_URL}/incidents`,
    CREATE: `${API_BASE_URL}/incidents`,
    DETAIL: (id) => `${API_BASE_URL}/incidents/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/incidents/${id}`,
    DELETE: (id) => `${API_BASE_URL}/incidents/${id}`,
    MY_REPORTS: `${API_BASE_URL}/incidents/my-reports`,
    BY_OWNER: (ownerId) => `${API_BASE_URL}/incidents/owner/${ownerId}`,
  },

  // Pets
  PETS: {
    BY_RFID: (rfid) => `${API_BASE_URL}/pets/rfid/${rfid}`,
    CREATE: `${API_BASE_URL}/pets`,
  },

  // Stray Animals
  STRAY_ANIMALS: {
    LIST: `${API_BASE_URL}/stray-animals`,
    DETAIL: (id) => `${API_BASE_URL}/stray-animals/${id}`,
    CREATE: `${API_BASE_URL}/stray-animals`,
    UPDATE: (id) => `${API_BASE_URL}/stray-animals/${id}`,
  },

  // Adoption Requests
  ADOPTION_REQUESTS: {
    LIST: `${API_BASE_URL}/adoption-requests`,
    CREATE: `${API_BASE_URL}/adoption-requests`,
    DETAIL: (id) => `${API_BASE_URL}/adoption-requests/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/adoption-requests/${id}`,
  },

  // Redemption Requests
  REDEMPTION_REQUESTS: {
    LIST: `${API_BASE_URL}/redemption-requests`,
    CREATE: `${API_BASE_URL}/redemption-requests`,
    DETAIL: (id) => `${API_BASE_URL}/redemption-requests/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/redemption-requests/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/notifications`,
    UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
    MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
    DELETE: (id) => `${API_BASE_URL}/notifications/${id}`,
  },

  // Dashboard (for staff users)
  DASHBOARD: {
    STATS: `${API_BASE_URL}/dashboard`,
    MAP_DATA: `${API_BASE_URL}/dashboard/map-data`,
  },

  // Health Check
  HEALTH: `${API_BASE_URL}/health`,
};

/**
 * Incident Types
 */
export const INCIDENT_TYPES = {
  STRAY: "stray",
  BITE: "bite",
  INJURED: "injured",
  DEAD: "dead",
  OTHER: "other",
};

export const INCIDENT_TYPE_LABELS = {
  [INCIDENT_TYPES.STRAY]: "Stray Animal",
  [INCIDENT_TYPES.BITE]: "Animal Bite",
  [INCIDENT_TYPES.INJURED]: "Injured Animal",
  [INCIDENT_TYPES.DEAD]: "Dead Animal",
  [INCIDENT_TYPES.OTHER]: "Other",
};

/**
 * Status
 */
export const STATUS = {
  PENDING_VERIFICATION: "pending_verification",
  VERIFIED: "verified",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
  REJECTED: "rejected",
};

export const STATUS_LABELS = {
  [STATUS.PENDING_VERIFICATION]: "Pending Verification",
  [STATUS.VERIFIED]: "Verified",
  [STATUS.ASSIGNED]: "Assigned",
  [STATUS.IN_PROGRESS]: "In Progress",
  [STATUS.RESOLVED]: "Resolved",
  [STATUS.CLOSED]: "Closed",
  [STATUS.REJECTED]: "Rejected",
};

export const STATUS_COLORS = {
  [STATUS.PENDING_VERIFICATION]: "#ffc107",
  [STATUS.VERIFIED]: "#0dcaf0",
  [STATUS.ASSIGNED]: "#0d6efd",
  [STATUS.IN_PROGRESS]: "#17a2b8",
  [STATUS.RESOLVED]: "#28a745",
  [STATUS.CLOSED]: "#6c757d",
  [STATUS.REJECTED]: "#dc3545",
};

/**
 * User Roles
 */
export const USER_ROLES = {
  USER: "user",
  VETERINARIAN: "veterinarian",
  ADMIN: "admin",
  CATCHER: "catcher",
};

export const ROLE_LABELS = {
  [USER_ROLES.USER]: "Pet Owner / Citizen",
  [USER_ROLES.VETERINARIAN]: "City Veterinarian",
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.CATCHER]: "Animal Catcher",
};

export default API_CONFIG;
