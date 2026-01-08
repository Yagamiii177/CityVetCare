import React, { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { apiService } from "../../../utils/api";

/**
 * ApprovalCenter - Component for managing pending clinic approvals
 */
const ApprovalCenter = ({
  pendingClinics = [],
  onApprove,
  onReject,
  onViewAll,
}) => {
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (clinicId) => {
    try {
      setProcessingId(clinicId);
      await apiService.adminDashboard.approveClinic(clinicId);
      if (onApprove) onApprove();
    } catch (error) {
      console.error("Failed to approve clinic:", error);
      alert("Failed to approve clinic. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (clinic) => {
    setSelectedClinic(clinic);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedClinic) return;

    try {
      setProcessingId(selectedClinic.clinic_id);
      await apiService.adminDashboard.rejectClinic(
        selectedClinic.clinic_id,
        rejectionReason
      );
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedClinic(null);
      if (onReject) onReject();
    } catch (error) {
      console.error("Failed to reject clinic:", error);
      alert("Failed to reject clinic. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const getDaysPending = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-amber-600" />
          Approval & Action Center
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm text-[#FA8630] hover:text-[#E87928] font-medium"
        >
          View All →
        </button>
      </div>

      {pendingClinics.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">All caught up!</p>
          <p className="text-sm text-gray-500">
            No pending approvals at this time
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingClinics.map((clinic) => {
            const daysPending = getDaysPending(clinic.date_created);
            const isUrgent = daysPending > 7;

            return (
              <div
                key={clinic.clinic_id}
                className={`border rounded-lg p-4 ${
                  isUrgent ? "border-amber-300 bg-amber-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {clinic.clinic_name}
                      </h3>
                      {isUrgent && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                          {daysPending} days pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {clinic.head_veterinarian}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-start gap-1">
                    <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      {clinic.address}, {clinic.barangay}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                    <span>{clinic.contact_number}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{clinic.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BuildingOffice2Icon className="h-4 w-4 flex-shrink-0" />
                    <span>License: {clinic.license_number}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(clinic.clinic_id)}
                    disabled={processingId === clinic.clinic_id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {processingId === clinic.clinic_id
                      ? "Processing..."
                      : "Approve"}
                  </button>
                  <button
                    onClick={() => handleRejectClick(clinic)}
                    disabled={processingId === clinic.clinic_id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Reject Clinic Registration
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject{" "}
              <strong>{selectedClinic?.clinic_name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedClinic(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ApprovalCenter };
