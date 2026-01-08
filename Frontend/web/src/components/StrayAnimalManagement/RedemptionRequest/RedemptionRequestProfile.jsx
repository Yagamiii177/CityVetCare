import { useEffect, useState, useCallback } from "react";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  TagIcon,
  HashtagIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { apiService, getImageUrl } from "../../../utils/api";

const RedemptionRequestProfile = ({
  request,
  onClose,
  onUpdate,
  isArchiveView = false,
}) => {
  const [stray, setStray] = useState(null);
  const [captureCount, setCaptureCount] = useState(null);
  const [proofImages, setProofImages] = useState([]);

  const openImageFullSize = (url) => {
    if (!url || typeof url !== "string") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const [decisionType, setDecisionType] = useState(null); // 'approve' | 'reject'
  const [decisionNotes, setDecisionNotes] = useState("");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimRfid, setClaimRfid] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const normalizeStatus = (status) => {
    const s = (status || "").toLowerCase();
    if (["approved", "accept", "accepted"].includes(s)) return "approved";
    if (["rejected", "declined", "decline"].includes(s)) return "rejected";
    return "pending";
  };

  const statusBadge = (status) => {
    const s = normalizeStatus(status);
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    if (s === "approved") return "bg-green-100 text-green-800";
    if (s === "rejected") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getDisplayStatus = (status) => {
    const s = normalizeStatus(status);
    if (s === "approved") return "APPROVED";
    return s.toUpperCase();
  };

  const extractProofImages = useCallback(() => {
    console.log("Extracting proof images from request:", request);
    const candidates = [
      request?.proof_images,
      request?.proofOfOwnership,
      request?.proof,
      request?.proof_urls,
    ];
    for (const c of candidates) {
      if (!c) continue;
      console.log("Found candidate:", c, typeof c);
      try {
        if (Array.isArray(c)) return c.filter(Boolean).map(getImageUrl);
        if (typeof c === "string") {
          // JSON array or comma-separated
          const trimmed = c.trim();
          let arr = [];
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            arr = JSON.parse(trimmed);
          } else {
            arr = trimmed.split(",").map((s) => s.trim());
          }
          const images = arr.filter(Boolean).map(getImageUrl);
          console.log("Extracted images:", images);
          return images;
        }
        if (typeof c === "object") {
          return Object.values(c).filter(Boolean).map(getImageUrl);
        }
      } catch (e) {
        console.error("Error parsing proof images:", e);
      }
    }
    console.log("No proof images found");
    return [];
  }, [request]);

  useEffect(() => {
    setProofImages(extractProofImages());
  }, [extractProofImages]);

  useEffect(() => {
    let mounted = true;
    const loadStrayAndCounts = async () => {
      try {
        const res = await apiService.strayAnimals.getById(request.stray_id);
        const strayData =
          res?.data?.data || res?.data || res?.data?.animal || null;
        if (mounted) setStray(strayData);
        // Prefer count from request payload (backend join) if present
        if (
          request?.capture_count !== undefined &&
          request.capture_count !== null
        ) {
          setCaptureCount(Number(request.capture_count) || 0);
          return;
        }
        const rfid = strayData?.rfid;
        if (rfid) {
          try {
            const petRes = await apiService.pets.getByRfid(rfid);
            const pet = petRes?.data?.pet;
            if (mounted && pet?.capture_count !== undefined) {
              setCaptureCount(Number(pet.capture_count) || 0);
            }
          } catch {
            // ignore if pet lookup fails
          }
        }
      } catch {
        // ignore
      }
    };
    loadStrayAndCounts();
    return () => {
      mounted = false;
    };
  }, [request.stray_id, request.capture_count]);

  const openDecision = (type) => {
    setDecisionType(type);
    setDecisionNotes("");
    setError(null);
  };

  const closeDecision = () => {
    setDecisionType(null);
    setDecisionNotes("");
    setSubmitting(false);
    setError(null);
  };

  const openClaim = () => {
    setClaimError(null);
    setClaimRfid("");
    const existing = String(stray?.rfid || request?.rfid || "").trim();
    if (existing) {
      // If RFID is already present, claim directly.
      submitClaim(existing);
      return;
    }
    setClaimModalOpen(true);
  };

  const closeClaim = () => {
    setClaimModalOpen(false);
    setClaimRfid("");
    setClaimSubmitting(false);
    setClaimError(null);
  };

  const submitClaim = async (rfidOverride) => {
    setClaimSubmitting(true);
    setClaimError(null);
    try {
      const rfidValue = String(rfidOverride || claimRfid || "").trim();
      if (!rfidValue) {
        setClaimError("RFID is required to claim this pet.");
        setClaimSubmitting(false);
        return;
      }
      // Only increment capture count if RFID was manually entered (no existing RFID)
      const wasManuallyEntered = !rfidOverride;
      await apiService.redemptionRequests.claim(request.redemption_id, {
        rfid: rfidValue,
        incrementCaptureCount: wasManuallyEntered,
      });

      closeClaim();
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      setClaimError("Failed to claim pet. Please try again.");
      setClaimSubmitting(false);
    }
  };

  const submitDecision = async () => {
    if (!decisionType) return;
    setSubmitting(true);
    setError(null);
    try {
      const newStatus = decisionType === "approve" ? "approved" : "rejected";
      await apiService.redemptionRequests.update(request.redemption_id, {
        status: newStatus,
      });

      // Notify owner
      if (request.owner_id) {
        const title =
          newStatus === "approved"
            ? "Redemption Request Approved"
            : "Redemption Request Declined";
        const msg =
          `Your redemption request for ${
            request.animal_name || "your pet"
          } has been ${newStatus}.` +
          (decisionNotes ? `\n\nNotes: ${decisionNotes}` : "");
        await apiService.notifications.createForUser({
          userId: request.owner_id,
          userType: "owner",
          title,
          message: msg,
          type: "redemption_request",
        });
      }

      closeDecision();
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      setError("Failed to update request. Please try again.");
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiService.redemptionRequests.update(request.redemption_id, {
        status: "archived",
      });

      if (onUpdate) onUpdate();
      onClose();
    } catch {
      setError("Failed to archive request. Please try again.");
      setSubmitting(false);
    }
  };

  // Derive a robust primary image for the stray
  const primaryStrayImage = useCallback(() => {
    const img = stray?.images;
    if (!img) return null;
    try {
      if (Array.isArray(img)) {
        const firstImg = img[0];
        return firstImg ? getImageUrl(firstImg) : null;
      }
      if (typeof img === "string") {
        const trimmed = img.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          const arr = JSON.parse(trimmed);
          if (Array.isArray(arr) && arr.length) {
            const firstImg = arr[0];
            return firstImg ? getImageUrl(firstImg) : null;
          }
        }
        // If it's a plain relative path or URL
        return getImageUrl(trimmed);
      }
      if (typeof img === "object") {
        const vals = Object.values(img).filter(Boolean);
        if (vals.length) return getImageUrl(vals[0]);
      }
    } catch (e) {
      // ignore parse errors
      console.error("Error parsing stray images:", e);
    }
    return null;
  }, [stray]);

  const imageSrc = primaryStrayImage();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#FA8630] px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Pet Redemption Request Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Redeemer Information */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              Redeemer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-800">
                  {request.owner_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-800">
                  {request.owner_email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-semibold text-gray-800">
                  {request.owner_contact || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Home Address</p>
                <p className="font-semibold text-gray-800">
                  {request.owner_address || request.address || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Stray Animal Information */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <TagIcon className="h-5 w-5 text-white" />
              </div>
              Stray Animal Details
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={stray?.name || request.name || "Animal"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  ) : null}
                  <div
                    className={`flex items-center justify-center w-full h-full text-sm text-gray-500 ${
                      imageSrc ? "hidden" : ""
                    }`}
                  >
                    No Image Available
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.name || request.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Species</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.species || request.species || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Breed</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.breed || request.breed || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sex</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.sex || request.sex || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.color || request.color || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sprayed/Neutered</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.sprayed_neutered || request.sprayed_neutered
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                  {(stray?.rfid || request.rfid) && (
                    <div>
                      <p className="text-sm text-gray-500">RFID</p>
                      <p className="font-semibold text-gray-800">
                        {stray?.rfid || request.rfid}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Markings</p>
                    <p className="font-semibold text-gray-800">
                      {stray?.markings || request.markings || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capture & Registration Details */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </div>
              Capture &amp; Registration Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Date Captured</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(stray?.date_captured || request.date_captured)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location Captured</p>
                <p className="font-semibold text-gray-800">
                  {stray?.location_captured || request.location_captured || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capture Count</p>
                <p
                  className={`font-bold text-lg ${
                    (captureCount || 0) >= 3 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {captureCount ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {stray?.status || request.status || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Proof of Ownership */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
              Proof of Ownership
            </h3>
            {proofImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {proofImages.map((image, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative bg-gray-50"
                  >
                    <img
                      src={image}
                      alt={`Proof ${index + 1}`}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageFullSize(image)}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb =
                          e.currentTarget.parentElement?.querySelector(
                            ".proof-fallback"
                          );
                        if (fb) fb.classList.remove("hidden");
                      }}
                    />
                    <div className="proof-fallback hidden absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-gray-50">
                      Image unavailable
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No proof images provided.
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </div>
              Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(request.request_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(
                    request.status
                  )}`}
                >
                  {getDisplayStatus(request.status)}
                </span>
              </div>
              {request.remarks && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p className="font-medium text-gray-800">{request.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t bg-white px-6 py-4 flex flex-wrap justify-end gap-3 rounded-b-lg">
          {!isArchiveView && normalizeStatus(request?.status) === "pending" && (
            <>
              <button
                onClick={() => openDecision("reject")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => openDecision("approve")}
                className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#e67a2a] focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-colors"
              >
                Approve
              </button>
            </>
          )}
          {normalizeStatus(request?.status) === "approved" && (
            <>
              <button
                onClick={openClaim}
                className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#e67a2a] focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-colors"
              >
                Pet Claimed
              </button>
              <button
                onClick={handleArchive}
                disabled={submitting}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Archiving..." : "Put to Archive"}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Claim RFID Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h4 className="font-semibold">Enter RFID</h4>
              <button
                onClick={closeClaim}
                className="text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  RFID (required)
                </label>
                <input
                  value={claimRfid}
                  onChange={(e) => setClaimRfid(e.target.value)}
                  placeholder="Enter 9-character RFID"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA8630]"
                />
              </div>
              {claimError && (
                <div className="text-sm text-red-600">{claimError}</div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={closeClaim}
                className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => submitClaim()}
                disabled={claimSubmitting}
                className="px-4 py-2 rounded-md text-white bg-[#FA8630] hover:bg-[#e67a2a] disabled:opacity-60"
              >
                {claimSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h4 className="font-semibold">
                {decisionType === "approve"
                  ? "Confirm Acceptance"
                  : "Reason for Decline"}
              </h4>
              <button
                onClick={closeDecision}
                className="text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {decisionType === "approve"
                    ? "Details / Notes (optional)"
                    : "Reason for Decline"}
                </label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={
                    decisionType === "approve"
                      ? "Add any additional notes..."
                      : "Please provide a reason for declining..."
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA8630]"
                  rows="4"
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={closeDecision}
                className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={submitting}
                className={`px-4 py-2 rounded-md text-white ${
                  decisionType === "approve"
                    ? "bg-[#FA8630] hover:bg-[#e67a2a]"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-60`}
              >
                {submitting
                  ? "Submitting..."
                  : decisionType === "approve"
                  ? "Confirm"
                  : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedemptionRequestProfile;
