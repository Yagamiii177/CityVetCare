import api from "../../../utils/api";

const CATEGORY_LABELS = {
  health: "Health Advisory",
  policy: "Policy Update",
  events: "Events",
  general: "General Info",
  draft: "Drafts",
  archive: "Archived",
};

const normalizeStatus = (status) => {
  if (!status) return "Draft";
  const value = String(status).trim();
  const lower = value.toLowerCase();
  switch (lower) {
    case "published":
      return "Published";
    case "scheduled":
      return "Scheduled";
    case "archived":
      return "Archived";
    case "draft":
    default:
      return "Draft";
  }
};

const normalizePriority = (priority) => {
  if (!priority) return "Medium";
  const value = String(priority).trim();
  const lower = value.toLowerCase();
  switch (lower) {
    case "high":
      return "High";
    case "low":
      return "Low";
    case "medium":
    default:
      return "Medium";
  }
};

const normalizeCategory = (category) => {
  if (!category) return "general";
  const lower = String(category).toLowerCase();
  return CATEGORY_LABELS[lower] ? lower : "general";
};

const pickField = (obj, keys) => {
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }
  return undefined;
};

const normalizeAnnouncement = (raw = {}) => {
  const category = normalizeCategory(
    pickField(raw, ["category", "category_id", "categoryKey"])
  );
  const status = normalizeStatus(pickField(raw, ["status", "state"]));
  const publishDate =
    pickField(raw, ["publishDate", "publish_date", "published_at"]) ||
    pickField(raw, ["schedule_date", "scheduledFor"]);

  const attachments = (pickField(raw, ["attachments", "files"]) || []).map(
    (file) => ({
      id:
        file.id ||
        file.attachment_id ||
        file.file_id ||
        file.storage_id ||
        file.name,
      name: file.name || file.file_name || "attachment",
      size: Number(file.size || file.file_size || 0),
      type: file.type || file.file_type || "file",
      url: file.url || file.file_url || file.path || "",
    })
  );

  const author =
    pickField(raw, ["author", "created_by", "createdBy", "admin_name"]) ||
    "Unknown";

  return {
    id:
      pickField(raw, ["id", "announcement_id"]) ||
      pickField(raw, ["_id", "uuid"]),
    title: pickField(raw, ["title", "name"]) || "Untitled Announcement",
    category,
    categoryName: CATEGORY_LABELS[category] || CATEGORY_LABELS.general,
    author,
    publishDate: publishDate || null,
    status,
    priority: normalizePriority(pickField(raw, ["priority"])) || "Medium",
    views: Number(pickField(raw, ["views", "view_count"])) || 0,
    description: pickField(raw, ["description", "content", "summary"]) || "",
    attachments,
    lastUpdated:
      pickField(raw, ["lastUpdated", "updated_at", "updatedAt"]) || null,
    isArchived: Boolean(
      pickField(raw, ["isArchived", "archived", "is_archived"]) ||
        status === "Archived"
    ),
    audience: pickField(raw, ["audience"]) || "public",
    content:
      pickField(raw, ["content"]) || pickField(raw, ["description"]) || "",
  };
};

const buildFormData = (payload = {}) => {
  const formData = new FormData();

  const normalizedStatus = normalizeStatus(payload.status);
  const normalizedPriority = normalizePriority(payload.priority);
  const normalizedCategory = normalizeCategory(payload.category);

  const fields = {
    title: payload.title,
    content: payload.content || payload.description,
    description: payload.description,
    category: normalizedCategory,
    priority: normalizedPriority,
    status: normalizedStatus,
    author: payload.author,
    audience: payload.audience || "public",
    publishDate: payload.publishDate,
    publishTime: payload.publishTime,
    scheduledFor: payload.scheduledFor,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  if (fields.publishDate) {
    formData.append("publish_date", fields.publishDate);
  }
  if (fields.publishTime) {
    formData.append("publish_time", fields.publishTime);
  }
  if (fields.scheduledFor) {
    formData.append("scheduled_for", fields.scheduledFor);
  }

  if (Array.isArray(payload.attachments)) {
    payload.attachments.forEach((file) => {
      if (file) {
        formData.append("attachments", file);
      }
    });
  }

  if (Array.isArray(payload.removedAttachmentIds)) {
    formData.append(
      "removedAttachmentIds",
      JSON.stringify(payload.removedAttachmentIds)
    );
  }

  return formData;
};

export const announcementService = {
  async list(params = {}) {
    const response = await api.get("/announcements", {
      params: {
        includeArchived: true,
        ...params,
      },
    });

    const payload = response?.data?.data ?? response?.data ?? [];
    const items = Array.isArray(payload) ? payload : [];
    return items.map(normalizeAnnouncement);
  },

  async get(id) {
    const response = await api.get(`/announcements/${id}`);
    const payload = response?.data?.data ?? response?.data ?? {};
    return normalizeAnnouncement(payload);
  },

  async create(payload) {
    const formData = buildFormData(payload);
    const response = await api.post("/announcements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const created = response?.data?.data ?? response?.data ?? payload;
    return normalizeAnnouncement(created);
  },

  async update(id, payload) {
    const formData = buildFormData(payload);
    const response = await api.put(`/announcements/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updated = response?.data?.data ?? response?.data ?? payload;
    return normalizeAnnouncement(updated);
  },

  async archive(id) {
    const response = await api.patch(`/announcements/${id}/archive`);
    const payload = response?.data?.data ??
      response?.data ?? { id, status: "Archived", isArchived: true };
    return normalizeAnnouncement({ ...payload, id });
  },

  async restore(id) {
    const response = await api.patch(`/announcements/${id}/restore`);
    const payload = response?.data?.data ??
      response?.data ?? { id, status: "Draft", isArchived: false };
    return normalizeAnnouncement({ ...payload, id });
  },
};

export { normalizeAnnouncement, CATEGORY_LABELS };
