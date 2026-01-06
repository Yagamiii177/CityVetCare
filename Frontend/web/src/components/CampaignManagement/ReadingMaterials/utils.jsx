export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getCategoryLabel = (type, category, categoryOptions) => {
  const categories = categoryOptions[type];
  const catObj = categories?.find((c) => c.value === category);
  return catObj ? catObj.label : category;
};

export const getStatusConfig = (status, statusOptions) => {
  return statusOptions.find((s) => s.value === status) || statusOptions[0];
};

export const getTypeConfig = (type, materialTypes) => {
  return materialTypes.find((t) => t.value === type) || materialTypes[0];
};

// Build backend base URL (strip trailing /api for asset access)
export const getBackendBaseUrl = () => {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return apiBase.replace(/\/?api\/?$/, "");
};

// Normalize image URLs so relative /uploads paths point to the backend host
export const normalizeImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = getBackendBaseUrl();
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
};
