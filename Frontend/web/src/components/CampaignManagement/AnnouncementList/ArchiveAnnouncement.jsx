import { useState } from "react";
import {
  ArchiveBoxIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Mock API service - replace with actual API calls
const archiveAnnouncementAPI = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate random success/failure for testing
      const success = Math.random() > 0.2; // 80% success rate
      if (success) {
        resolve({
          success: true,
          message: "Announcement archived successfully",
        });
      } else {
        reject(new Error("Failed to archive announcement. Please try again."));
      }
    }, 800);
  });
};

const ArchiveAnnouncement = ({ announcement, onClose, onConfirm }) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!announcement) return null;

  const handleArchive = async () => {
    setIsArchiving(true);
    setError(null);

    try {
      // API call to archive announcement
      await archiveAnnouncementAPI(announcement.id);

      // Success state
      setSuccess(true);

      // Wait a moment to show success message before closing
      setTimeout(() => {
        // Call parent callback with the archived ID
        onConfirm(announcement.id);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Archive error:", err);
      setError(err.message || "Failed to archive announcement");
      setIsArchiving(false);
    }
  };

  const handleCancel = () => {
    if (!isArchiving && !success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg relative">
        <button
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCancel}
          disabled={isArchiving || success}
        >
          <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </button>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Archived Successfully!
              </h3>
              <p className="text-sm text-gray-600">
                The announcement has been moved to archive.
              </p>
              <div className="mt-4">
                <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-[progress_1s_ease-in-out]"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <ArchiveBoxIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Archive Announcement
                </h3>
                <p className="text-sm text-gray-600">
                  This announcement will be moved to the archive. You can
                  restore it later if needed.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 hover:text-red-800 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    {announcement.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>By {announcement.author}</span>
                    <span>•</span>
                    <span>{announcement.categoryName}</span>
                    <span>•</span>
                    <span>{announcement.publishDate}</span>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span>Current Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          announcement.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : announcement.status === "Scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {announcement.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>New Status:</span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        Archived
                      </span>
                    </div>
                    {announcement.views !== undefined && (
                      <div className="flex items-center justify-between mt-1">
                        <span>Views:</span>
                        <span>{announcement.views.toLocaleString()}</span>
                      </div>
                    )}
                    {announcement.attachments?.length > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <span>Attachments:</span>
                        <span>{announcement.attachments.length} file(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isArchiving}
                  className="flex-1 py-2 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="flex-1 py-2 px-4 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isArchiving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <ArchiveBoxIcon className="h-4 w-4" />
                      Archive Announcement
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveAnnouncement;
