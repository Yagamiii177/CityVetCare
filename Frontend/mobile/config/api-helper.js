/**
 * API Configuration Helper
 * Automatically detects the correct API URL based on the platform
 */

import { NativeModules, Platform } from "react-native";
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

  // For iOS Simulator, localhost is usually correct, but we still try to
  // derive a LAN host first (useful when Constants.isDevice is misreported).

  // For physical devices (or Expo Go on LAN), derive host from Expo runtime.
  // Expo SDKs vary: pull from multiple places.
  const debuggerHost =
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    Constants?.debuggerHost ||
    null;

  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.hostUri ||
    null;

  // React Native can expose the Metro bundle URL. This is often the most
  // reliable way to find the dev server host on physical devices.
  const scriptURL = NativeModules?.SourceCode?.scriptURL || null;

  const hostCandidates = [
    parseHostFromHostPort(debuggerHost),
    parseHostFromHostPort(hostUri),
    parseHostFromUri(scriptURL),
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

  // If we're on iOS simulator, localhost is typically reachable.
  if (Platform.OS === "ios" && !Constants.isDevice) {
    return localhost;
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
