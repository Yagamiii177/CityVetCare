/**
 * Constants for CityVetCare Application
 * Centralized constants and configuration
 */

// Incident Status
export const INCIDENT_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  VERIFIED: 'Verified',
  RESOLVED: 'Resolved',
};

// Incident Priority
export const INCIDENT_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Incident Types
export const INCIDENT_TYPES = {
  BITE: 'Bite Incident',
  ANIMAL_BITE: 'Animal Bite',
  RABIES: 'Rabies Suspected',
  STRAY: 'Stray Animal',
  NUISANCE: 'Animal Nuisance',
  ATTACK: 'Animal Attack',
  OTHER: 'Other',
};

// Animal Types
export const ANIMAL_TYPES = {
  DOG: 'Dog',
  CAT: 'Cat',
  OTHER: 'Other',
  UNKNOWN: 'Unknown',
};

// Status Colors for UI
export const STATUS_COLORS = {
  [INCIDENT_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
  },
  [INCIDENT_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-500',
  },
  [INCIDENT_STATUS.VERIFIED]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: 'text-orange-500',
  },
  [INCIDENT_STATUS.RESOLVED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-500',
  },
};

// Priority Colors for UI
export const PRIORITY_COLORS = {
  [INCIDENT_PRIORITY.LOW]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  [INCIDENT_PRIORITY.MEDIUM]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  [INCIDENT_PRIORITY.HIGH]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
  [INCIDENT_PRIORITY.CRITICAL]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  INCIDENTS: '/incidents.php',
  CATCHERS: '/catchers.php',
  SCHEDULES: '/schedules.php',
  DASHBOARD: '/dashboard.php',
  AUTH: '/auth.php',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'CityVetCare',
  VERSION: '1.0.0',
  DEFAULT_LOCALE: 'en-PH',
};

// Validation Rules
export const VALIDATION_RULES = {
  PHONE: {
    pattern: /^(09|\+639)\d{9}$/,
    message: 'Please enter a valid Philippine mobile number (09XXXXXXXXX)',
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  REQUIRED: {
    message: 'This field is required',
  },
};
