/**
 * API Service for CityVetCare Mobile App
 * 
 * This service handles all HTTP requests to the backend API.
 * It provides methods for CRUD operations on incidents and other resources.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api-config';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@cityvetcare_access_token',
};

/**
 * Get stored access token
 */
const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Generic fetch wrapper with error handling and authentication
 */
const fetchWithError = async (url, options = {}) => {
  try {
    // Get token for authenticated requests
    const token = await getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Request with authentication');
    } else {
      console.log('🔓 Request without authentication (emergency report)');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 60000); // 60 second default timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('🚨 API Error:', error.message);
    throw new Error(error.message || 'Network request failed');
  }
};

/**
 * Incident/Report API Service
 */
export const incidentService = {
  /**
   * Get all incidents
   * @param {Object} filters - Optional filters (status, date, etc.)
   */
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.INCIDENTS.LIST}?${queryParams}`
      : API_ENDPOINTS.INCIDENTS.LIST;
    
    const response = await fetchWithError(url, {
      method: 'GET',
    });
    
    // Backend returns {data: [...]} structure
    return response;
  },

  /**
   * Get incident by ID
   * @param {number} id - Incident ID
   */
  getById: async (id) => {
    return fetchWithError(API_ENDPOINTS.INCIDENTS.DETAIL(id), {
      method: 'GET',
    });
  },

  /**
   * Get all incidents reported by a specific owner
   * @param {number} ownerId - The pet owner ID
   * @param {object} filters - Optional filters (status)
   */
  getByOwnerId: async (ownerId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.INCIDENTS.LIST}/owner/${ownerId}?${queryParams}`
      : `${API_ENDPOINTS.INCIDENTS.LIST}/owner/${ownerId}`;
    
    console.log('📡 Fetching owner reports:', url);
    
    const response = await fetchWithError(url, {
      method: 'GET',
    });
    
    return response;
  },

  /**
   * Upload images for incident report
   * @param {Array} imageUris - Array of local image URIs
   * @returns {Promise<Array>} Array of server image URLs
   */
  uploadImages: async (imageUris) => {
    try {
      if (!imageUris || imageUris.length === 0) {
        console.log('ℹ️  No images to upload, skipping...');
        return [];
      }

      console.log(`📤 Uploading ${imageUris.length} image(s)...`);
      const formData = new FormData();

      // Append each image to form data
      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        console.log(`  Image ${i + 1}: ${filename} (${type})`);

        formData.append('images', {
          uri: uri,
          name: filename || `photo_${Date.now()}.jpg`,
          type: type
        });
      }

      // Get token for authenticated uploads
      const token = await getAccessToken();
      const headers = {};

      // IMPORTANT: Do NOT set Content-Type for FormData in React Native
      // The browser/React Native will set it automatically with the correct boundary
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Uploading with authentication');
      } else {
        console.log('🔓 Uploading without authentication');
      }

      // Upload images to the correct endpoint
      const uploadUrl = `${API_ENDPOINTS.INCIDENTS.LIST}/upload-images`;
      console.log('📡 Upload URL:', uploadUrl);

      // Create AbortController for timeout (3 minutes for image uploads)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Image upload timeout after 180 seconds');
        controller.abort();
      }, 180000); // 180 seconds for image uploads

      let response;
      try {
        response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          headers, // Let React Native set Content-Type automatically
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Image upload timed out. Please check your internet connection and try again.');
        }
        throw fetchError;
      }

      console.log('📥 Upload response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Upload failed:', data);
        
        // Provide user-friendly error messages
        if (data.code === 'FILE_TOO_LARGE') {
          throw new Error('One or more images are too large. Please use photos smaller than 10MB.');
        }
        if (data.code === 'TOO_MANY_FILES') {
          throw new Error('Too many images. Maximum is 10 images per report.');
        }
        
        throw new Error(data.message || 'Failed to upload images');
      }

      console.log('✅ Images uploaded successfully:', data.images);
      return data.images || [];
    } catch (error) {
      console.error('❌ Image upload error:', error);
      
      // Re-throw with original message if it's already user-friendly
      if (error.message.includes('too large') || error.message.includes('Too many')) {
        throw error;
      }
      
      throw new Error('Failed to upload images: ' + error.message);
    }
  },

  /**
   * Create new incident report
   * @param {Object} reportData - Report data including location, images, etc.
   * @param {Object} user - Authenticated user object (optional, for authenticated reports)
   */
  create: async (reportData, user = null) => {
    try {
      console.log('📝 Creating incident report...', {
        reportType: reportData.reportType,
        hasImages: reportData.images?.length > 0,
        location: reportData.location,
        isAuthenticated: !!user
      });

      // Step 1: Upload images first if any
      let imageUrls = [];
      if (reportData.images && reportData.images.length > 0) {
        console.log('📤 Uploading images...');
        imageUrls = await incidentService.uploadImages(reportData.images);
        console.log('✅ Images uploaded:', imageUrls);
      }

      // Step 2: Generate title based on report type
      let title = 'Animal Report';
      if (reportData.reportType === 'incident') {
        title = 'Incident/Bite Report';
      } else if (reportData.reportType === 'stray') {
        title = 'Stray Animal Report';
      } else if (reportData.reportType === 'lost') {
        title = 'Lost Pet Report';
      }

      // Step 3: Format the incident date properly
      let incidentDate;
      try {
        // Handle both Date objects and ISO strings
        const dateObj = typeof reportData.date === 'string' ? new Date(reportData.date) : reportData.date;
        incidentDate = dateObj.toISOString().replace('T', ' ').split('.')[0];
      } catch (e) {
        console.warn('Date parsing failed, using current date');
        incidentDate = new Date().toISOString().replace('T', ' ').split('.')[0];
      }

      // Step 4: Prepare the data for submission
      const payload = {
        title: title,
        description: reportData.description || 'No description provided',
        location: reportData.location 
          ? `${reportData.location.latitude},${reportData.location.longitude}` 
          : '',
        latitude: reportData.location?.latitude || null,
        longitude: reportData.location?.longitude || null,
        status: 'pending',
        reporter_name: user?.full_name || reportData.reporterName || 'Mobile User',
        reporter_contact: reportData.contactNumber || '',
        incident_date: incidentDate,
        incident_type: reportData.reportType || 'incident',
        pet_color: reportData.petColor || null,
        pet_breed: reportData.petBreed || null,
        animal_type: reportData.animalType || null,
        pet_gender: reportData.petGender || null,
        pet_size: reportData.petSize || null,
        images: imageUrls, // Send as array
        // Add owner_id if user is authenticated
        owner_id: user?.owner_id || user?.id || null
      };

      console.log('📤 Submitting report to backend...', {
        ...payload,
        isAuthenticated: !!payload.owner_id
      });

      // Step 5: Submit the report
      const result = await fetchWithError(API_ENDPOINTS.INCIDENTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('✅ Report submitted successfully!', result);
      return result;
    } catch (error) {
      console.error('❌ Report submission error:', error);
      throw error;
    }
  },

  /**
   * Update incident status
   * @param {number} id - Incident ID
   * @param {string} status - New status
   */
  updateStatus: async (id, status) => {
    return fetchWithError(API_ENDPOINTS.INCIDENTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Delete incident
   * @param {number} id - Incident ID
   */
  delete: async (id) => {
    return fetchWithError(API_ENDPOINTS.INCIDENTS.DELETE(id), {
      method: 'DELETE',
    });
  },
};

/**
 * Dashboard API Service
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    return fetchWithError(API_ENDPOINTS.dashboard.stats, {
      method: 'GET',
    });
  },

  /**
   * Get recent reports
   */
  getRecentReports: async () => {
    return fetchWithError(API_ENDPOINTS.dashboard.recentReports, {
      method: 'GET',
    });
  },
};

/**
 * Catcher Team API Service
 */
export const catcherService = {
  /**
   * Get all catcher teams
   */
  getAll: async () => {
    return fetchWithError(API_ENDPOINTS.catchers.getAll, {
      method: 'GET',
    });
  },

  /**
   * Get catcher team schedule
   */
  getSchedule: async () => {
    return fetchWithError(API_ENDPOINTS.catchers.schedule, {
      method: 'GET',
    });
  },
};

/**
 * Health check service
 */
export const healthService = {
  check: async () => {
    return fetchWithError(API_ENDPOINTS.health, {
      method: 'GET',
    });
  },
};

export default {
  incident: incidentService,
  dashboard: dashboardService,
  catcher: catcherService,
  health: healthService,
};
