import { XMarkIcon, CheckIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const AdopterProfile = ({ adopter, animal, onClose, onStatusChange }) => {
  const [decision, setDecision] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (decision) {
      const statusData = {
        status: decision,
        ...(decision === "Rejected" && { rejectionReason }),
        nextSteps,
        notes,
      };
      onStatusChange(adopter.id, statusData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">
              Adoption Application for {animal.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Personal Information
                </h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Full Name:</span>{" "}
                    {adopter.name}
                  </p>
                  <p>
                    <span className="font-medium">Age:</span>{" "}
                    {adopter.details.age}
                  </p>
                  <p>
                    <span className="font-medium">Contact:</span>{" "}
                    {adopter.phone}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {adopter.email}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {adopter.details.address}
                  </p>
                  <p>
                    <span className="font-medium">Valid ID:</span> {adopter.id}
                  </p>
                </div>
              </div>

              {/* Living Situation */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Living Situation
                </h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Residence Type:</span>{" "}
                    {adopter.details.residenceType}
                  </p>
                  <p>
                    <span className="font-medium">Ownership:</span>{" "}
                    {adopter.details.ownershipStatus}
                  </p>
                  <p>
                    <span className="font-medium">Household Size:</span>{" "}
                    {adopter.details.householdSize}
                  </p>
                  <p>
                    <span className="font-medium">Children at Home:</span>{" "}
                    {adopter.details.hasChildren ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pet Experience */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                Pet Experience
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Owned pets before:</span>{" "}
                  {adopter.details.petExperience ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Current pets:</span>{" "}
                  {adopter.details.currentPets}
                </p>
                <p>
                  <span className="font-medium">Experience level:</span>{" "}
                  {adopter.details.familiarity}
                </p>
              </div>
            </div>

            {/* Commitment */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                Commitment & Compatibility
              </h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Adoption reason:</span>{" "}
                  {adopter.details.adoptionReason}
                </p>
                <p>
                  <span className="font-medium">Daily alone time:</span>{" "}
                  {adopter.details.aloneTime}
                </p>
                <p>
                  <span className="font-medium">Living arrangement:</span>{" "}
                  {adopter.details.livingArrangement}
                </p>
                <p>
                  <span className="font-medium">Vet commitment:</span>{" "}
                  {adopter.details.vetCommitment ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* Decision-specific sections */}
            {decision === "Rejected" && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                <h4 className="text-lg font-medium text-red-900">
                  Rejection Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="rejectionReason"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reason for Rejection *
                    </label>
                    <select
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="Incomplete application">
                        Incomplete application
                      </option>
                      <option value="Not suitable living situation">
                        Not suitable living situation
                      </option>
                      <option value="Lack of pet experience">
                        Lack of pet experience
                      </option>
                      <option value="Not compatible with this animal">
                        Not compatible with this animal
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {decision === "Approved" && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h4 className="text-lg font-medium text-green-900">
                  Next Steps for Approval
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="nextSteps"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Next Steps *
                    </label>
                    <select
                      id="nextSteps"
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select next steps</option>
                      <option value="Schedule home visit">
                        Schedule home visit
                      </option>
                      <option value="Schedule meet & greet">
                        Schedule meet & greet
                      </option>
                      <option value="Prepare adoption paperwork">
                        Prepare adoption paperwork
                      </option>
                      <option value="Ready for immediate adoption">
                        Ready for immediate adoption
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Additional notes (shown for both decisions) */}
            {decision && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Additional Notes
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional comments or instructions..."
                  className="w-full p-3 border border-gray-300 rounded-md h-24"
                />
              </div>
            )}
          </div>

          {/* Decision Buttons */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setDecision("Approved")}
                className={`flex items-center px-4 py-2 rounded-md ${
                  decision === "Approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setDecision("Rejected")}
                className={`flex items-center px-4 py-2 rounded-md ${
                  decision === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Reject
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !decision ||
                  (decision === "Rejected" && !rejectionReason) ||
                  (decision === "Approved" && !nextSteps)
                }
                className={`px-4 py-2 rounded-md ${
                  !decision ||
                  (decision === "Rejected" && !rejectionReason) ||
                  (decision === "Approved" && !nextSteps)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#FA8630] text-white hover:bg-[#E87928]"
                }`}
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdopterProfile;
