import { XMarkIcon } from "@heroicons/react/24/outline";

const RedemptionRequestProfile = ({ request, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#FA8630] px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
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
        <div className="p-6">
          {/* Owner Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-medium text-gray-800">{request.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium text-gray-800">{request.age}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium text-gray-800">
                  {request.contactNumber}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-800">{request.email}</p>
              </div>
              <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Home Address</p>
                <p className="font-medium text-gray-800">{request.address}</p>
              </div>
            </div>
          </div>

          {/* Pet Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Pet to Redeem
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  <img
                    src={request.petToRedeem.image}
                    alt={request.petToRedeem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-800">
                      {request.petToRedeem.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Species</p>
                    <p className="font-medium text-gray-800">
                      {request.petToRedeem.species}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Breed</p>
                    <p className="font-medium text-gray-800">
                      {request.petToRedeem.breed}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-800">
                      {request.petToRedeem.gender}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium text-gray-800">
                      {request.petToRedeem.color}
                    </p>
                  </div>
                  <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Markings</p>
                    <p className="font-medium text-gray-800">
                      {request.petToRedeem.markings}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proof of Ownership */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Proof of Ownership
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {request.proofOfOwnership.map((image, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={image}
                    alt={`Proof ${index + 1}`}
                    className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Request Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-medium text-gray-800">
                  {request.requestDate}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === "Pending Review"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "Approved"
                      ? "bg-blue-100 text-blue-800"
                      : request.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Additional Notes
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {request.notes || "No additional notes provided"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {request.status === "Pending Review" && (
              <>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
                  Reject Request
                </button>
                <button className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#e67a2a] focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-colors">
                  Approve Request
                </button>
              </>
            )}
            {request.status === "Approved" && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                Mark as Completed
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedemptionRequestProfile;
