import axios from 'axios';

/**
 * API Configuration
 * Base configuration for backend API requests
 */

// Base API URL - Must be set in .env file
if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is not set. Please check your .env file.');
}

const API_BASE_URL = import.meta.env.VITE_API_URL.trim();

const isDevelopment = import.meta.env.MODE === 'development';

// Only log in development mode
if (isDevelopment) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
  withCredentials: false,
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Only log in development mode
    if (isDevelopment) {
      console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('❌ Request Setup Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('✅ API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Log errors only in development
    if (isDevelopment) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }
    
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('auth_token');
          break;
        case 403:
        case 404:
        case 500:
          // Handle silently or show user-friendly message
          break;
      }
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Incidents
  incidents: {
    getAll: (filters = {}) => api.get('/incidents', { params: filters }),
    getById: (id) => api.get(`/incidents/${id}`),
    create: (data) => api.post('/incidents', data),
    update: (id, data) => api.put(`/incidents/${id}`, data),
    delete: (id) => api.delete(`/incidents/${id}`),
    getStatusCounts: () => api.get('/incidents/status-counts'),
    uploadImages: (files) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      return api.post('/incidents/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
  },

  // Catcher Teams
  catchers: {
    getAll: (filters = {}) => api.get('/catchers', { params: filters }),
    getById: (id) => api.get(`/catchers/${id}`),
    create: (data) => api.post('/catchers', data),
    update: (id, data) => api.put(`/catchers/${id}`, data),
    delete: (id) => api.delete(`/catchers/${id}`),
  },

  // Schedules
  schedules: {
    getAll: (filters = {}) => api.get('/schedules', { params: filters }),
    getById: (id) => api.get(`/schedules/${id}`),
    create: (data) => api.post('/schedules', data),
    update: (id, data) => api.put(`/schedules/${id}`, data),
    delete: (id) => api.delete(`/schedules/${id}`),
  },

  // Patrol Staff
  patrolStaff: {
    getAll: (filters = {}) => api.get('/patrol-staff', { params: filters }),
    getById: (id) => api.get(`/patrol-staff/${id}`),
    create: (data) => api.post('/patrol-staff', data),
    update: (id, data) => api.put(`/patrol-staff/${id}`, data),
    delete: (id) => api.delete(`/patrol-staff/${id}`),
  },

  // Patrol Schedules
  patrolSchedules: {
    getAll: (filters = {}) => api.get('/patrol-schedules', { params: filters }),
    getById: (id) => api.get(`/patrol-schedules/${id}`),
    create: (data) => api.post('/patrol-schedules', data),
    update: (id, data) => api.put(`/patrol-schedules/${id}`, data),
    delete: (id) => api.delete(`/patrol-schedules/${id}`),
  },

  // Dashboard
  dashboard: {
    getStats: () => api.get('/dashboard'),
  },

  // Authentication
  auth: {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    verify: () => api.get('/auth'),
  },
};

export default api;

/**
 * Helper function to get full image URL
 * Converts relative image path to full URL
 * @param {string} imagePath - Relative image path (e.g., "/uploads/incident-images/image.jpg")
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove /api from base URL for static file serving
  // API_BASE_URL is like "http://localhost:3000/api"
  // But images are served at "http://localhost:3000/uploads"
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // If it's a relative path, prepend the base URL
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
