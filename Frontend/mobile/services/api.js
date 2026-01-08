/**
 * Mobile API Service
 * Handles all API communication with Node.js backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, API_ENDPOINTS } from "../config/api-config";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "@cityvetcare_access_token",
  REFRESH_TOKEN: "@cityvetcare_refresh_token",
  USER_DATA: "@cityvetcare_user",
  OFFLINE_QUEUE: "@cityvetcare_offline_queue",
};

/**
 * Base fetch with timeout
 */
const fetchWithTimeout = async (
  url,
  options = {},
  timeout = API_CONFIG.TIMEOUT
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
};

/**
 * Get stored access token
 */
const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

/**
 * Get stored refresh token
 */
const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

/**
 * Store tokens
 */
const storeTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken || ""],
    ]);
  } catch (error) {
    console.error("Error storing tokens:", error);
  }
};

/**
 * Clear all auth data
 */
const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetchWithTimeout(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    await storeTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    await clearAuthData();
    throw error;
  }
};

/**
 * Make authenticated API request
 */
const apiRequest = async (url, options = {}, requiresAuth = true) => {
  try {
    let headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    let response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });

    // Try to refresh token if unauthorized
    if (response.status === 401 && requiresAuth) {
      try {
        const newToken = await refreshAccessToken();
        headers["Authorization"] = `Bearer ${newToken}`;

        response = await fetchWithTimeout(url, {
          ...options,
          headers,
        });
      } catch (refreshError) {
        throw new Error("Session expired. Please login again.");
      }
    }

    // Parse response
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

/**
 * Upload file with multipart/form-data
 */
const uploadFile = async (url, formData, requiresAuth = true) => {
  try {
    let headers = {};

    if (requiresAuth) {
      const token = await getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    let response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers,
        body: formData,
      },
      API_CONFIG.UPLOAD_TIMEOUT
    );

    // Try to refresh token if unauthorized
    if (response.status === 401 && requiresAuth) {
      try {
        const newToken = await refreshAccessToken();
        headers["Authorization"] = `Bearer ${newToken}`;

        response = await fetchWithTimeout(
          url,
          {
            method: "POST",
            headers,
            body: formData,
          },
          API_CONFIG.UPLOAD_TIMEOUT
        );
      } catch (refreshError) {
        throw new Error("Session expired. Please login again.");
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

// ==================== AUTH API ====================

export const authAPI = {
  /**
   * Login
   */
  login: async (username, password, userType = "pet_owner") => {
    const data = await apiRequest(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify({ username, password, userType }),
      },
      false
    );

    // Store token (backend returns 'token', not 'accessToken')
    if (data.token) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.token);
    }

    // Build user object from response
    const user = {
      id: data.userId,
      userType: data.userType,
      fullName: data.fullName,
      full_name: data.fullName, // Alias for compatibility
    };

    // Add type-specific fields
    if (data.userType === "admin") {
      user.username = data.username;
      user.role = data.role;
    } else if (data.userType === "pet_owner") {
      user.email = data.email;
      user.contactNumber = data.contactNumber;
    }

    // Store user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return { ...data, user };
  },

  /**
   * Register
   */
  register: async (userData) => {
    const data = await apiRequest(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
      false
    );

    // Registration only creates account, doesn't auto-login
    // User should login afterwards
    return {
      success: data.success,
      message: data.message || "Registration successful",
      ownerId: data.ownerId,
    };
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return await apiRequest(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      // For JWT auth, we only need to clear local storage
      // No server-side session to invalidate
      await clearAuthData();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear data even if there's an error
      await clearAuthData();
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Get stored user data
   */
  getStoredUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    const token = await getAccessToken();
    return !!token;
  },
};

// ==================== INCIDENTS API ====================

export const incidentsAPI = {
  /**
   * Get all incidents
   */
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.INCIDENTS.LIST}?${queryParams}`
      : API_ENDPOINTS.INCIDENTS.LIST;
    return await apiRequest(url);
  },

  /**
   * Get user's own reports
   */
  getMyReports: async () => {
    return await apiRequest(API_ENDPOINTS.INCIDENTS.MY_REPORTS);
  },

  /**
   * Get incident by ID
   */
  getById: async (id) => {
    return await apiRequest(API_ENDPOINTS.INCIDENTS.DETAIL(id));
  },

  /**
   * Create incident with images
   */
  create: async (incidentData, imageUris = []) => {
    const formData = new FormData();

    // Add text fields
    Object.keys(incidentData).forEach((key) => {
      if (incidentData[key] !== null && incidentData[key] !== undefined) {
        formData.append(key, incidentData[key].toString());
      }
    });

    // Add images
    imageUris.forEach((uri, index) => {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("images", {
        uri,
        name: filename || `incident_image_${index}.jpg`,
        type,
      });
    });

    return await uploadFile(API_ENDPOINTS.INCIDENTS.CREATE, formData);
  },

  /**
   * Update incident
   */
  update: async (id, updates) => {
    return await apiRequest(API_ENDPOINTS.INCIDENTS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete incident
   */
  delete: async (id) => {
    return await apiRequest(API_ENDPOINTS.INCIDENTS.DELETE(id), {
      method: "DELETE",
    });
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsAPI = {
  /**
   * Get all notifications
   */
  getAll: async () => {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.LIST);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  },

  /**
   * Mark as read
   */
  markRead: async (id) => {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: "PUT",
    });
  },

  /**
   * Mark all as read
   */
  markAllRead: async () => {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: "PUT",
    });
  },

  /**
   * Delete notification
   */
  delete: async (id) => {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.DELETE(id), {
      method: "DELETE",
    });
  },
};

// ==================== OFFLINE QUEUE ====================

export const offlineAPI = {
  /**
   * Save incident to offline queue
   */
  saveToQueue: async (incidentData) => {
    try {
      const queue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      const queueArray = queue ? JSON.parse(queue) : [];

      queueArray.push({
        ...incidentData,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      });

      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(queueArray)
      );
      return true;
    } catch (error) {
      console.error("Error saving to offline queue:", error);
      return false;
    }
  },

  /**
   * Get offline queue
   */
  getQueue: async () => {
    try {
      const queue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error("Error getting offline queue:", error);
      return [];
    }
  },

  /**
   * Sync offline queue
   */
  syncQueue: async () => {
    try {
      const queue = await offlineAPI.getQueue();

      if (queue.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      const results = {
        success: true,
        synced: 0,
        failed: 0,
        errors: [],
      };

      for (const item of queue) {
        try {
          const { id, timestamp, ...incidentData } = item;
          await incidentsAPI.create(incidentData, incidentData.imageUris || []);
          results.synced++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            item: item.id,
            error: error.message,
          });
        }
      }

      // Clear queue if all synced
      if (results.failed === 0) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.OFFLINE_QUEUE,
          JSON.stringify([])
        );
      }

      return results;
    } catch (error) {
      console.error("Error syncing offline queue:", error);
      return {
        success: false,
        synced: 0,
        failed: 0,
        error: error.message,
      };
    }
  },

  /**
   * Clear offline queue
   */
  clearQueue: async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify([])
      );
      return true;
    } catch (error) {
      console.error("Error clearing offline queue:", error);
      return false;
    }
  },
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  check: async () => {
    return await apiRequest(API_ENDPOINTS.HEALTH, {}, false);
  },
};

/**
 * Stray Animals API
 */
const strayAnimalsAPI = {
  list: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const url = query
      ? `${API_ENDPOINTS.STRAY_ANIMALS.LIST}?${query}`
      : API_ENDPOINTS.STRAY_ANIMALS.LIST;
    return await apiRequest(url);
  },

  getById: async (id) => {
    return await apiRequest(API_ENDPOINTS.STRAY_ANIMALS.DETAIL(id));
  },

  create: async (data) => {
    return await apiRequest(API_ENDPOINTS.STRAY_ANIMALS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiRequest(API_ENDPOINTS.STRAY_ANIMALS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Get animals available for adoption (status = 'adoption')
  listAdoption: async () => {
    return await apiRequest(
      `${API_ENDPOINTS.STRAY_ANIMALS.LIST}?status=adoption`
    );
  },
};

/**
 * Adoption Requests API
 */
const adoptionRequestsAPI = {
  create: async (data) => {
    return await apiRequest(API_ENDPOINTS.ADOPTION_REQUESTS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listByUser: async (ownerId) => {
    return await apiRequest(
      `${API_ENDPOINTS.ADOPTION_REQUESTS.LIST}?adopter_id=${ownerId}`
    );
  },
};

/**
 * Pet API
 */
const petsAPI = {
  getByRfid: async (rfid) => {
    return await apiRequest(API_ENDPOINTS.PETS.BY_RFID(rfid));
  },
};

/**
 * Redemption Requests API
 */
const redemptionRequestsAPI = {
  create: async (data) => {
    return await apiRequest(API_ENDPOINTS.REDEMPTION_REQUESTS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listByOwner: async (ownerId) => {
    return await apiRequest(
      `${API_ENDPOINTS.REDEMPTION_REQUESTS.LIST}?owner_id=${ownerId}`
    );
  },
};

export default {
  auth: authAPI,
  incidents: incidentsAPI,
  notifications: notificationsAPI,
  offline: offlineAPI,
  health: healthAPI,
  strayAnimals: strayAnimalsAPI,
  pets: petsAPI,
  adoptionRequests: adoptionRequestsAPI,
  redemptionRequests: redemptionRequestsAPI,
};
