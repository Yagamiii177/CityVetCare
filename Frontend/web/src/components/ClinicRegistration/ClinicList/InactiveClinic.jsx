import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { apiService } from "../../../utils/api";

const InactiveClinic = ({ clinic, isOpen, onClose, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  if (!isOpen || !clinic) return null;

  const handleMarkInactive = async () => {
    setIsUpdating(true);
    try {
      const response = await apiService.clinics.updateStatus(clinic.id, {
        status: "Inactive",
      });

      setNotification({
        show: true,
        message: "Clinic marked as inactive successfully!",
        type: "success",
      });

      if (onStatusChange) {
        onStatusChange(response.data);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating clinic status:", error);
      setNotification({
        show: true,
        message:
          error?.response?.data?.message || "Failed to update clinic status",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivate = async () => {
    setIsUpdating(true);
    try {
      const response = await apiService.clinics.updateStatus(clinic.id, {
        status: "Active",
      });

      setNotification({
        show: true,
        message: "Clinic activated successfully!",
        type: "success",
      });

      if (onStatusChange) {
        onStatusChange(response.data);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating clinic status:", error);
      setNotification({
        show: true,
        message:
          error?.response?.data?.message || "Failed to update clinic status",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isCurrentlyInactive =
    clinic.status === "Inactive" || clinic.status === "Suspended";

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center p-2 animate-slide-down">
          <div
            className={`w-full max-w-lg rounded-lg px-6 py-4 shadow-lg ${
              notification.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 h-5 w-5 ${
                  notification.type === "error"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {notification.type === "error" ? (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <XCircleIcon className="h-6 w-6 text-gray-600" />
              Update Clinic Status
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Clinic Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {clinic.name}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Veterinarian:</span>{" "}
                {clinic.veterinarian}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">License:</span>{" "}
                {clinic.licenseNumber}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Current Status:
                </span>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    clinic.status === "Active"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : clinic.status === "Pending"
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      : "bg-gray-50 text-gray-700 border border-gray-200"
                  }`}
                >
                  {clinic.status}
                </span>
              </div>
            </div>

            {/* Warning/Info Message */}
            <div
              className={`rounded-lg p-4 ${
                isCurrentlyInactive
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {isCurrentlyInactive ? (
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-semibold mb-1 ${
                      isCurrentlyInactive ? "text-blue-800" : "text-yellow-800"
                    }`}
                  >
                    {isCurrentlyInactive
                      ? "Clinic is Currently Inactive"
                      : "Mark Clinic as Inactive?"}
                  </h4>
                  <p
                    className={`text-sm ${
                      isCurrentlyInactive ? "text-blue-700" : "text-yellow-700"
                    }`}
                  >
                    {isCurrentlyInactive
                      ? "This clinic is not currently operating. You can reactivate it to make it available again."
                      : "Marking this clinic as inactive will prevent it from appearing in active listings. The clinic data will be preserved and can be reactivated later."}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isCurrentlyInactive ? (
                <button
                  onClick={handleActivate}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  {isUpdating ? "Activating..." : "Activate Clinic"}
                </button>
              ) : (
                <button
                  onClick={handleMarkInactive}
                  disabled={isUpdating}
                  className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <XCircleIcon className="h-5 w-5" />
                  {isUpdating ? "Updating..." : "Mark as Inactive"}
                </button>
              )}
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InactiveClinic;
