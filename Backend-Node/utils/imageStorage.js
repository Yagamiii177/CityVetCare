import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, "..", "uploads");

export const ensureUploadsDir = (subdir) => {
  const dir = path.join(uploadsRoot, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

export const isDataUrlImage = (val = "") => {
  if (typeof val !== "string") return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(val.trim());
};

export const isAllowedImageRef = (val = "") => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("file:")) return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/uploads") ||
    trimmed.startsWith("uploads/")
  );
};

export const saveDataUrlImage = async (
  dataUrl,
  { subdir, prefix, maxBytes = 6 * 1024 * 1024 } = {}
) => {
  const trimmed = String(dataUrl || "").trim();
  const match = trimmed.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.*)$/i);
  if (!match) return null;

  const ext =
    match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const base64 = match[2];

  let buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return null;
  }

  if (buffer.length > maxBytes) return null;

  const uploadDir = ensureUploadsDir(subdir);
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${prefix || "image"}-${unique}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/${subdir}/${filename}`;
};

export const persistIncomingImage = async (image, opts) => {
  if (!image) return null;
  const val = String(image || "").trim();
  if (!val) return null;

  if (isDataUrlImage(val)) {
    return await saveDataUrlImage(val, opts);
  }

  if (isAllowedImageRef(val)) return val;

  return null;
};

export const persistIncomingImages = async (images, opts) => {
  if (!images) return [];

  const toValues = () => {
    if (Array.isArray(images)) return images;

    if (typeof images === "string") {
      const trimmed = images.trim();
      if (!trimmed) return [];
      if (isDataUrlImage(trimmed)) return [trimmed];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === "object") return Object.values(parsed);
        return [trimmed];
      } catch {
        return [trimmed];
      }
    }

    if (typeof images === "object") return Object.values(images);

    return [];
  };

  const values = toValues().filter(Boolean);
  const persisted = await Promise.all(
    values.map((v) => persistIncomingImage(v, opts))
  );

  return persisted.filter(Boolean);
};
