import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  HomeIcon,
  TagIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState, useCallback } from "react";
import { apiService, getImageUrl } from "../../../utils/api";
import ConfirmDialog from "../../common/ConfirmDialog";

const normalizeStatus = (status) => {
  const s = (status || "").toLowerCase();
  if (["approved", "accept", "accepted"].includes(s)) return "approved";
  if (["rejected", "declined", "decline"].includes(s)) return "rejected";
  return "pending";
};

const statusBadgeClass = (status) => {
  const s = normalizeStatus(status);
  if (s === "pending") return "bg-yellow-100 text-yellow-800";
  if (s === "approved") return "bg-green-100 text-green-800";
  if (s === "rejected") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const safeParseApplicantDetails = (raw) => {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
};

const AdoptionProfile = ({
  request,
  onClose,
  onUpdate,
  isArchiveView = false,
}) => {
  const [stray, setStray] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimRfid, setClaimRfid] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // approve | reject | archive
  const [confirmNotes, setConfirmNotes] = useState("");

  const applicantDetails = useMemo(
    () => safeParseApplicantDetails(request?.applicant_details),
    [request?.applicant_details]
  );

  const openImageFullSize = (url) => {
    if (!url || typeof url !== "string") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    let mounted = true;
    const loadStray = async () => {
      try {
        const res = await apiService.strayAnimals.getById(request.stray_id);
        const strayData = res?.data?.data || res?.data || null;
        if (mounted) setStray(strayData);
      } catch {
        // ignore
      }
    };
    if (request?.stray_id) loadStray();
    return () => {
      mounted = false;
    };
  }, [request?.stray_id]);

  const submitStatus = async (status, { notes } = {}) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiService.adoptionRequests.update(request.adoption_id, { status });

      // Notify adopter when an adoption is approved (web requirement)
      if (String(status).toLowerCase() === "approved" && request?.adopter_id) {
        const title = "Adoption Request Approved";
        const msg =
          `Your adoption request for ${
            request?.animal_name || "the animal"
          } has been approved.` + (notes ? `\n\nNext steps: ${notes}` : "");
        await apiService.notifications.createForUser({
          userId: request.adopter_id,
          userType: "owner",
          title,
          message: msg,
          type: "adoption_request",
        });
      }

      if (onUpdate) await onUpdate();
      onClose();
    } catch (e) {
      console.error("Failed to update adoption request", e);
      setError("Failed to update request. Please try again.");
      setSubmitting(false);
    }
  };

  const openConfirm = (action) => {
    if (submitting || claimSubmitting) return;
    setConfirmAction(action);
    setConfirmNotes("");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmNotes("");
  };

  const confirmSubmit = async () => {
    const action = confirmAction;
    if (!action) return;
    if (action === "approve") {
      await submitStatus("approved", { notes: confirmNotes.trim() });
      return;
    }
    if (action === "reject") {
      await submitStatus("rejected");
      return;
    }
    if (action === "archive") {
      await submitStatus("archived");
    }
  };

  const openClaim = () => {
    setClaimError(null);
    setClaimRfid("");

    const existing = String(stray?.rfid || request?.rfid || "").trim();
    if (existing) {
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
        setClaimError("RFID is required to mark this pet as claimed.");
        setClaimSubmitting(false);
        return;
      }
      await apiService.adoptionRequests.claim(request.adoption_id, {
        rfid: rfidValue,
      });

      closeClaim();
      if (onUpdate) await onUpdate();
      onClose();
    } catch {
      setClaimError("Failed to claim pet. Please try again.");
      setClaimSubmitting(false);
    }
  };

  const status = normalizeStatus(request?.status);

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
            return arr[0] ? getImageUrl(arr[0]) : null;
          }
        }
        return getImageUrl(trimmed);
      }
      if (typeof img === "object") {
        const vals = Object.values(img).filter(Boolean);
        if (vals.length) return getImageUrl(vals[0]);
      }
    } catch {
      // ignore
    }
    return null;
  }, [stray]);

  const imageSrc = primaryStrayImage();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#FA8630] px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              Adoption Request Details
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-white/90 text-sm font-semibold">
                #{request?.adoption_id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white`}
              >
                {status.toUpperCase()}
              </span>
              <span className="text-white/80 text-xs">
                Submitted: {formatDate(request?.request_date)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Adopter Information */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              Adopter Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-800">
                  {request?.adopter_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-800">
                  {request?.adopter_email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adopter ID</p>
                <p className="font-semibold text-gray-800">
                  {request?.adopter_id ? `#${request.adopter_id}` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Stray Animal Details */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <TagIcon className="h-5 w-5 text-white" />
              </div>
              Animal Details
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={request?.animal_name || "Animal"}
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
                    <p className="text-sm text-gray-500">Stray ID</p>
                    <p className="font-semibold text-gray-800">
                      #{request?.stray_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-800">
                      {request?.animal_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Species</p>
                    <p className="font-semibold text-gray-800">
                      {request?.species || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Breed</p>
                    <p className="font-semibold text-gray-800">
                      {request?.breed || "-"}
                    </p>
                  </div>
                  {String(stray?.rfid || "").trim() ? (
                    <div>
                      <p className="text-sm text-gray-500">RFID</p>
                      <p className="font-semibold text-gray-800">
                        {String(stray?.rfid).trim()}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div className="mb-6 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <HomeIcon className="h-5 w-5 text-white" />
              </div>
              Applicant Details
            </h3>

            {applicantDetails ? (
              <div className="space-y-4">
                {applicantDetails.validIdImage ? (
                  <div>
                    <div className="text-sm font-semibold text-gray-800 mb-2">
                      Valid ID
                    </div>
                    <img
                      src={getImageUrl(applicantDetails.validIdImage)}
                      alt="Valid ID"
                      className="max-h-64 w-auto rounded-md border border-gray-200 cursor-pointer"
                      onClick={() =>
                        openImageFullSize(
                          getImageUrl(applicantDetails.validIdImage)
                        )
                      }
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["Full Name", applicantDetails.fullName],
                    ["Age", applicantDetails.age],
                    ["Phone", applicantDetails.phone],
                    ["Email", applicantDetails.email],
                    ["Address", applicantDetails.address],
                    ["Residence Type", applicantDetails.residenceType],
                    ["Ownership Status", applicantDetails.ownershipStatus],
                    [
                      "Landlord Permission",
                      applicantDetails.landlordPermission,
                    ],
                    ["Fenced Yard", applicantDetails.fencedYard],
                    ["Household Members", applicantDetails.householdMembers],
                    ["Has Children", applicantDetails.hasChildren],
                    ["Children Ages", applicantDetails.childrenAges],
                    ["Previous Pets", applicantDetails.previousPets],
                    ["Current Pets", applicantDetails.currentPets],
                    [
                      "Current Pets Details",
                      applicantDetails.currentPetsDetails,
                    ],
                    [
                      "Pet Care Familiarity",
                      applicantDetails.petCareFamiliarity,
                    ],
                    ["Reason", applicantDetails.adoptionReason],
                    ["Alone Hours", applicantDetails.aloneHours],
                    ["Pet Location", applicantDetails.petLocation],
                    [
                      "Can Commit Vet Visits",
                      applicantDetails.canCommitVetVisits,
                    ],
                    ["Willing To Return", applicantDetails.willingToReturn],
                  ]
                    .filter(
                      ([, v]) => v !== undefined && v !== null && v !== ""
                    )
                    .filter(([label]) => label !== "Valid ID")
                    .map(([label, value]) => (
                      <div key={label}>
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="font-semibold text-gray-800">
                          {typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : String(value)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No applicant details provided.
              </div>
            )}
          </div>

          {/* Request Metadata */}
          <div className="mb-2 bg-white rounded-lg p-6 border-l-4 border-[#FA8630] shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
              <div className="bg-[#FA8630] p-2 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </div>
              Request Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(request?.request_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex justify-end gap-2">
          {!isArchiveView && status === "pending" ? (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                onClick={() => openConfirm("reject")}
                disabled={submitting}
              >
                <XCircleIcon className="h-5 w-5" />
                Reject
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-[#FA8630] hover:bg-[#E87928] disabled:opacity-60"
                onClick={() => openConfirm("approve")}
                disabled={submitting}
              >
                <CheckCircleIcon className="h-5 w-5" />
                Approve
              </button>
            </>
          ) : null}

          {!isArchiveView && status === "approved" ? (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => openConfirm("archive")}
                disabled={submitting || claimSubmitting}
              >
                Archive
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-[#FA8630] hover:bg-[#E87928] disabled:opacity-60"
                onClick={openClaim}
                disabled={submitting || claimSubmitting}
              >
                Pet Claimed
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={submitting || claimSubmitting}
          >
            Close
          </button>
        </div>
      </div>

      {/* Claim (RFID) Modal */}
      {claimModalOpen ? (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-[#FA8630] px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Enter RFID</h3>
              <button
                onClick={closeClaim}
                className="text-white hover:text-gray-200"
                disabled={claimSubmitting}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {claimError ? (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {claimError}
                </div>
              ) : null}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFID
              </label>
              <input
                type="text"
                value={claimRfid}
                onChange={(e) => setClaimRfid(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                placeholder="Enter RFID"
                disabled={claimSubmitting}
              />

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={closeClaim}
                  disabled={claimSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-[#FA8630] hover:bg-[#E87928] disabled:opacity-60"
                  onClick={() => submitClaim()}
                  disabled={claimSubmitting}
                >
                  {claimSubmitting ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmSubmit}
        isLoading={submitting}
        title={
          confirmAction === "approve"
            ? "Approve Adoption Request"
            : confirmAction === "reject"
            ? "Reject Adoption Request"
            : "Archive Adoption Request"
        }
        message={
          confirmAction === "approve"
            ? "Approve this adoption request? Add optional notes for next steps."
            : confirmAction === "reject"
            ? "Reject this adoption request?"
            : "Archive this adoption request?"
        }
        confirmText={
          confirmAction === "approve"
            ? "Approve"
            : confirmAction === "reject"
            ? "Reject"
            : "Archive"
        }
        cancelText="Cancel"
        type={confirmAction === "reject" ? "danger" : "warning"}
      >
        {confirmAction === "approve" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Next steps)
            </label>
            <textarea
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              placeholder="e.g., Please visit CityVetCare on Jan 12 for screening and paperwork."
              disabled={submitting}
            />
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
};

export default AdoptionProfile;
