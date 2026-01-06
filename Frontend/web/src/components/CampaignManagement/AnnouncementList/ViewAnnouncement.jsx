import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  PhotoIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { announcementService } from "./announcementService";

const ViewAnnouncement = ({ announcement, onClose }) => {
  const [announcementDetails, setAnnouncementDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (announcement) {
      loadAnnouncementDetails();
    }
  }, [announcement]);

  const loadAnnouncementDetails = async () => {
    // If announcement is already a full object, use it directly
    if (announcement && announcement.id && announcement.title) {
      setAnnouncementDetails(announcement);
      return;
    }

    // Otherwise, fetch details by ID
    if (
      announcement?.id ||
      typeof announcement === "string" ||
      typeof announcement === "number"
    ) {
      setIsLoading(true);
      setError(null);
      try {
        const idToFetch =
          typeof announcement === "object" ? announcement.id : announcement;
        const data = await announcementService.get(idToFetch);
        setAnnouncementDetails(data);
      } catch (err) {
        console.error("Error loading announcement details:", err);
        setError("Failed to load announcement details");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Published: "bg-green-50 text-green-700 border border-green-200",
      Scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
      Draft: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      Archived: "bg-gray-50 text-gray-700 border border-gray-200",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          styles[status] || styles.Draft
        }`}
      >
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      High: "bg-red-50 text-red-700 border border-red-200",
      Medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      Low: "bg-green-50 text-green-700 border border-green-200",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          styles[priority] || styles.Medium
        }`}
      >
        {priority}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "document":
        return "📝";
      default:
        return "📎";
    }
  };

  if (!announcement) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        <button
          className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={onClose}
          disabled={isLoading}
        >
          <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </button>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="h-8 w-8 border-2 border-[#FA8630] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Loading announcement details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-3" />
              <p className="text-gray-700 mb-2">{error}</p>
              <button
                onClick={loadAnnouncementDetails}
                className="text-sm text-[#FA8630] hover:text-[#E87928]"
              >
                Retry
              </button>
            </div>
          ) : announcementDetails ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-[#FA8630]/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#FA8630]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {announcementDetails.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(announcementDetails.status)}
                    {getPriorityBadge(announcementDetails.priority)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Author</p>
                      <p className="text-sm font-medium text-gray-900">
                        {announcementDetails.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">
                        {announcementDetails.status === "Scheduled"
                          ? "Scheduled For"
                          : "Published Date"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {announcementDetails.publishDate}
                        {announcementDetails.scheduledFor && (
                          <span className="text-xs text-gray-500 ml-1">
                            (Scheduled)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Audience</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {announcementDetails.audience}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {announcementDetails.categoryName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Views</p>
                      <p className="text-sm font-medium text-gray-900">
                        {announcementDetails.views?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Attachments</p>
                      <p className="text-sm font-medium text-gray-900">
                        {announcementDetails.attachments?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {announcementDetails.updatedAt
                        ? new Date(
                            announcementDetails.updatedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {announcementDetails.attachments &&
                announcementDetails.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-800 mb-3">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {announcementDetails.attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <span className="text-lg">
                                {getFileIcon(file.type)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {file.type?.toUpperCase()} •{" "}
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Content
                </h3>
                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {announcementDetails.description ||
                    announcementDetails.content}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <ExclamationCircleIcon className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No announcement data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAnnouncement;
