/**
 * API Configuration Helper
 * Automatically detects the correct API URL based on the platform
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the appropriate API base URL based on environment
 */
export const getApiBaseUrl = () => {
  // In production, use the production URL
  if (__DEV__ === false) {
    return 'https://your-domain.com/api';
  }

  // Development URLs
  const localhost = 'http://localhost:3000/api';
  
  // For Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  
  // For iOS Simulator
  if (Platform.OS === 'ios') {
    return localhost;
  }
  
  // For physical devices, try to use the manifest host
  const { manifest } = Constants;
  if (manifest && manifest.debuggerHost) {
    const host = manifest.debuggerHost.split(':')[0];
    return `http://${host}:3000/api`;
  }
  
  // Default fallback
  return localhost;
};

/**
 * Test API connection
 */
export const testApiConnection = async () => {
  const baseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        url: baseUrl,
        status: data
      };
    } else {
      return {
        success: false,
        url: baseUrl,
        error: `Server returned ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      url: baseUrl,
      error: error.message
    };
  }
};

export default {
  getApiBaseUrl,
  testApiConnection
};
