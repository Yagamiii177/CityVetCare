import {
  XMarkIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { apiService } from "../../../utils/api";

const ViewClinic = ({ clinic, onClose, onEdit, onApprove }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  if (!clinic) return null;

  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-green-50 text-green-700 border border-green-200",
      Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      Inactive: "bg-gray-50 text-gray-700 border border-gray-200",
      Suspended: "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          styles[status] || styles.Pending
        }`}
      >
        {status}
      </span>
    );
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await apiService.clinics.approve(clinic.id);
      setNotification({
        show: true,
        message: "Clinic approved successfully!",
        type: "success",
      });
      if (onApprove) {
        onApprove(response.data);
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.error("Error approving clinic:", error);
      setNotification({
        show: true,
        message: error?.response?.data?.message || "Failed to approve clinic",
        type: "error",
      });
    } finally {
      setIsApproving(false);
    }
  };

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

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-2xl my-8 rounded-xl shadow-2xl relative animate-fadeIn">
          {/* Close Button */}
          <button
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>

          {/* Scrollable Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Header Section */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between pr-12">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#FA8630]/10 rounded-lg">
                      <BuildingOffice2Icon className="h-6 w-6 text-[#FA8630]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {clinic.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        License: {clinic.licenseNumber}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(clinic.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Head Veterinarian</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        {clinic.veterinarian}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">License Number</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <DocumentTextIcon className="h-4 w-4" />
                        {clinic.licenseNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900 flex items-start gap-1">
                        <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{clinic.address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Contact
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <PhoneIcon className="h-4 w-4" />
                        <a
                          href={`tel:${clinic.phone}`}
                          className="text-[#FA8630] hover:text-[#E87928]"
                        >
                          {clinic.phone}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4" />
                        <a
                          href={`mailto:${clinic.email}`}
                          className="text-[#FA8630] hover:text-[#E87928] truncate"
                        >
                          {clinic.email}
                        </a>
                      </p>
                    </div>
                    {clinic.workingHours &&
                      clinic.workingHours.days &&
                      clinic.workingHours.openingTime &&
                      clinic.workingHours.closingTime && (
                        <div>
                          <p className="text-xs text-gray-500">Working Hours</p>
                          <p className="text-sm font-medium text-gray-900">
                            {clinic.workingHours.days}
                          </p>
                          <p className="text-xs text-gray-600">
                            {clinic.workingHours.openingTime} -{" "}
                            {clinic.workingHours.closingTime}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Services */}
              {clinic.services && clinic.services.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Services
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {clinic.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Registration Date</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {clinic.registrationDate
                        ? new Date(clinic.registrationDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {clinic.lastUpdated
                        ? new Date(clinic.lastUpdated).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                {clinic.status === "Pending" && (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ViewClinic;

