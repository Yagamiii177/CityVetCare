/**
 * API Configuration Helper
 * Automatically detects the correct API URL based on the platform
 */

import { Platform } from "react-native";
import Constants from "expo-constants";

const normalizeApiUrl = (url) => {
  const trimmed = String(url || "")
    .trim()
    .replace(/\/+$/, "");
  if (!trimmed) return trimmed;
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const parseHostFromHostPort = (hostPort) => {
  if (!hostPort) return null;
  const host = String(hostPort).split(":")[0];
  return host || null;
};

const parseHostFromUri = (uri) => {
  if (!uri) return null;
  const raw = String(uri);

  // dev-client style: exp+myapp://expo-development-client/?url=http%3A%2F%2F192.168.1.10%3A8081
  const urlParamMatch = raw.match(/[?&]url=([^&]+)/i);
  if (urlParamMatch && urlParamMatch[1]) {
    try {
      const decoded = decodeURIComponent(urlParamMatch[1]);
      const parsed = new URL(decoded);
      return parsed.hostname || null;
    } catch {
      // ignore
    }
  }

  try {
    const parsed = new URL(raw);
    return parsed.hostname || null;
  } catch {
    return null;
  }
};

/**
 * Get the appropriate API base URL based on environment
 */
export const getApiBaseUrl = () => {
  // Allow env override (Expo supports EXPO_PUBLIC_* at build time)
  const envUrl =
    process?.env?.EXPO_PUBLIC_API_BASE_URL ||
    process?.env?.EXPO_PUBLIC_API_URL ||
    process?.env?.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) {
    return normalizeApiUrl(envUrl);
  }

  // In production, use the production URL
  if (__DEV__ === false) {
    return "https://your-domain.com/api";
  }

  // Development URLs
  const localhost = "http://localhost:3000/api";

  // Android emulator uses the special 10.0.2.2 host.
  // On a physical Android device, this will NOT work.
  if (Platform.OS === "android" && !Constants.isDevice) {
    return "http://10.0.2.2:3000/api";
  }

  // For iOS Simulator
  if (Platform.OS === "ios" && !Constants.isDevice) {
    return localhost;
  }

  // For physical devices (or Expo Go on LAN), derive host from Expo runtime.
  // SDK 54: Constants.manifest can be null; prefer expoConfig/hostUri.
  const debuggerHost =
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    null;

  const hostCandidates = [
    parseHostFromHostPort(debuggerHost),
    parseHostFromUri(Constants?.linkingUri),
    parseHostFromUri(Constants?.experienceUrl),
  ].filter(Boolean);

  const host = hostCandidates.find(
    (candidate) =>
      candidate && candidate !== "localhost" && candidate !== "127.0.0.1"
  );

  if (host) {
    return `http://${host}:3000/api`;
  }

  if (Constants?.isDevice) {
    console.warn(
      "[CityVetCare] Could not auto-detect dev host IP. Set EXPO_PUBLIC_API_URL (e.g. http://192.168.x.x:3000/api). Falling back to localhost."
    );
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
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        url: baseUrl,
        status: data,
      };
    } else {
      return {
        success: false,
        url: baseUrl,
        error: `Server returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      url: baseUrl,
      error: error.message,
    };
  }
};

export default {
  getApiBaseUrl,
  testApiConnection,
};
