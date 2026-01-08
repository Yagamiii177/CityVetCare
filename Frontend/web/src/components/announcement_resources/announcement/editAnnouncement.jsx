import { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { announcementService } from "./announcementService";

const EditAnnouncement = ({ announcement, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  useEffect(() => {
    if (announcement) {
      loadAnnouncement();
    }
  }, [announcement]);

  const loadAnnouncement = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let announcementData;

      // If announcement is just an ID or minimal object, fetch details
      if (
        typeof announcement === "string" ||
        typeof announcement === "number" ||
        !announcement.content
      ) {
        announcementData = await announcementService.get(
          typeof announcement === "object" ? announcement.id : announcement
        );
      } else {
        announcementData = announcement;
      }

      setFormData({
        id: announcementData.id,
        title: announcementData.title || "",
        author: announcementData.author || "",
        content: announcementData.content || announcementData.description || "",
        priority: announcementData.priority || "Medium",
        status: announcementData.status || "Draft",
        category: announcementData.category || "general",
        attachments: announcementData.attachments || [],
        publishDate: announcementData.publishDate || "",
        publishTime: announcementData.publishTime || "",
        audience: announcementData.audience || "public",
        scheduledFor: announcementData.scheduledFor || null,
      });
    } catch (err) {
      console.error("Error loading announcement:", err);
      setError("Failed to load announcement details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Validate file sizes (10MB max)
    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(
        `Some files exceed 10MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    setUploadingFiles((prev) => [...prev, ...files]);
    setNewFiles((prev) => [...prev, ...files]);
    setUploadingFiles((prev) => prev.filter((f) => !files.includes(f)));
  };

  const handleRemoveExistingAttachment = (attachmentId) => {
    setRemovedAttachmentIds((prev) => [...prev, attachmentId]);
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  const handleRemoveNewFile = (fileIndex) => {
    setNewFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.author?.trim()) {
      alert("Please enter author name");
      return;
    }
    if (!formData.content?.trim()) {
      alert("Please enter announcement content");
      return;
    }

    // If scheduling, validate date/time
    if (formData.status === "Scheduled") {
      if (!formData.publishDate || !formData.publishTime) {
        alert("Please select both date and time for scheduling");
        return;
      }
      const scheduledDateTime = new Date(
        `${formData.publishDate}T${formData.publishTime}`
      );
      if (scheduledDateTime <= new Date()) {
        alert("Please select a future date and time for scheduling");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for API
      const submitData = {
        id: formData.id,
        title: formData.title.trim(),
        author: formData.author.trim(),
        content: formData.content.trim(),
        priority: formData.priority,
        status: formData.status,
        category: formData.category,
        audience: formData.audience,
        attachments: newFiles,
        removedAttachmentIds,
      };

      // Add schedule data if applicable
      if (formData.status === "Scheduled") {
        submitData.publishDate = formData.publishDate;
        submitData.publishTime = formData.publishTime;
        submitData.scheduledFor = `${formData.publishDate}T${formData.publishTime}`;
      } else if (formData.status === "Published") {
        submitData.publishDate = new Date().toISOString().split("T")[0];
        submitData.publishTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError(err?.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorities = ["Low", "Medium", "High"];
  const statuses = ["Draft", "Scheduled", "Published"];
  const categories = [
    { id: "health", name: "Health Advisory" },
    { id: "policy", name: "Policy Update" },
    { id: "events", name: "Events" },
    { id: "general", name: "General Info" },
  ];
  const audiences = [
    { id: "public", name: "General Public" },
    { id: "clinic", name: "Veterinary Clinics" },
    { id: "staff", name: "Internal Staff" },
    { id: "partner", name: "Partner Organizations" },
  ];

  if (isLoading || !formData) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg relative p-6">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-2 border-[#FA8630] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading announcement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Sticky header with close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Edit Announcement
            </h2>
            <button
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name or department"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience
                  </label>
                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {audiences.map((audience) => (
                      <option key={audience.id} value={audience.id}>
                        {audience.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Fields (only show when status is Scheduled) */}
              {formData.status === "Scheduled" && (
                <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-blue-800">
                      Schedule Publication
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Publish Date *
                      </label>
                      <input
                        type="date"
                        name="publishDate"
                        value={formData.publishDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Publish Time *
                      </label>
                      <input
                        type="time"
                        name="publishTime"
                        value={formData.publishTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                  {formData.publishDate && formData.publishTime && (
                    <p className="text-xs text-blue-600 mt-2">
                      Scheduled for:{" "}
                      {new Date(
                        `${formData.publishDate}T${formData.publishTime}`
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Attachments Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>

                {/* Existing Attachments */}
                {formData.attachments.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Current attachments:
                    </p>
                    <div className="space-y-2">
                      {formData.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExistingAttachment(attachment.id)
                            }
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Files */}
                {newFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      New files to upload:
                    </p>
                    <div className="space-y-2">
                      {newFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center gap-3">
                            <PhotoIcon className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(index)}
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploading Files */}
                {uploadingFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Uploading files:
                    </p>
                    <div className="space-y-2">
                      {uploadingFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200"
                        >
                          <div className="flex items-center gap-3">
                            <ClockIcon className="h-5 w-5 text-yellow-400 animate-pulse" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Uploading...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Files */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center cursor-pointer ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to add new files
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Images, PDFs, or documents (Max 10MB each)
                    </p>
                  </label>
                </div>

                {/* Summary */}
                {(removedAttachmentIds.length > 0 || newFiles.length > 0) && (
                  <div className="mt-2 text-xs text-gray-500">
                    {removedAttachmentIds.length > 0 && (
                      <p>
                        {removedAttachmentIds.length} attachment(s) marked for
                        removal
                      </p>
                    )}
                    {newFiles.length > 0 && (
                      <p>{newFiles.length} new file(s) to upload</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer with action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 mt-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FA8630] text-white py-2 px-4 rounded-lg hover:bg-[#E87928] transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAnnouncement;

