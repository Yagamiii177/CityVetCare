import { API_CONFIG } from "../config/api-config";

const getBaseOrigin = () => {
  // API_CONFIG.BASE_URL usually ends with `/api`
  return String(API_CONFIG.BASE_URL || "").replace(/\/api\/?$/, "");
};

export const resolveImageUri = (uri) => {
  if (!uri || typeof uri !== "string") return null;

  const trimmed = uri.trim();
  if (!trimmed) return null;

  // Already a fully qualified or local URI
  if (/^(https?:|data:|file:|content:)/i.test(trimmed)) return trimmed;

  // Protocol-relative URLs
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const origin = getBaseOrigin();
  if (!origin) return trimmed;

  // Common backend returns: "/uploads/..." or "uploads/..."
  if (trimmed.startsWith("/")) return `${origin}${trimmed}`;

  return `${origin}/${trimmed}`;
};
