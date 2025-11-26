import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import RedemptionRequestProfile from "../../components/StrayAnimalManagement/RedemptionRequest/RedemptionRequestProfile";

const RedemptionRequest = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [redemptionRequests, _setRedemptionRequests] = useState([
    {
      id: 1,
      name: "John Doe",
      age: "35",
      contactNumber: "09123456789",
      email: "john.doe@example.com",
      address: "123 Main St, Cityville",
      proofOfOwnership: [
        "https://example.com/proof1.jpg",
        "https://example.com/proof2.jpg",
      ],
      petToRedeem: {
        petId: "PET-001",
        name: "Buddy",
        species: "Dog",
        breed: "Golden Retriever",
        age: "3 years",
        color: "Golden",
        distinguishingMarks: "White patch on chest",
        microchipNumber: "123456789",
        lastSeen: "2023-05-20",
        captureLocation: "City Park",
      },
      requestDate: "2023-05-25",
      status: "Pending Review",
      notes: "Lost dog during evening walk",
    },
    {
      id: 2,
      name: "Maria Santos",
      age: "28",
      contactNumber: "09987654321",
      email: "maria.s@example.com",
      address: "456 Oak Ave, Townsville",
      proofOfOwnership: ["https://example.com/proof3.jpg"],
      petToRedeem: {
        petId: "PET-002",
        name: "Whiskers",
        species: "Cat",
        breed: "Persian",
        age: "2 years",
        color: "White",
        distinguishingMarks: "Blue eyes",
        microchipNumber: "987654321",
        lastSeen: "2023-06-05",
        captureLocation: "Near the market",
      },
      requestDate: "2023-06-10",
      status: "Approved",
      notes: "Cat escaped through window",
    },
    {
      id: 3,
      name: "Carlos Reyes",
      age: "42",
      contactNumber: "09223344556",
      email: "carlos.r@example.com",
      address: "789 Pine Rd, Villagetown",
      proofOfOwnership: [
        "https://example.com/proof4.jpg",
        "https://example.com/proof5.jpg",
        "https://example.com/proof6.jpg",
      ],
      petToRedeem: {
        petId: "PET-003",
        name: "Rocky",
        species: "Dog",
        breed: "German Shepherd",
        age: "5 years",
        color: "Black and Tan",
        distinguishingMarks: "Cropped ears",
        microchipNumber: "456123789",
        lastSeen: "2023-06-12",
        captureLocation: "Near school",
      },
      requestDate: "2023-06-15",
      status: "Completed",
      notes: "Dog was found by animal control",
    },
  ]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      status: "",
    });
    setSearchTerm("");
  };

  const openRequestProfile = (request) => {
    setSelectedRequest(request);
    setIsProfileOpen(true);
  };

  const closeRequestProfile = () => {
    setIsProfileOpen(false);
    setSelectedRequest(null);
  };

  const filteredRequests = redemptionRequests.filter((request) => {
    if (!request) return false;

    const matchesSearch =
      searchTerm === "" ||
      request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.petToRedeem?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.petToRedeem?.petId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "" || request.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const hasFilters = filters.status !== "" || searchTerm !== "";

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - Animal Control Officer" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Pet Redemption Requests</h1>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px] max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by owner name, pet name or pet ID"
                  className="pl-10 pr-4 py-2 w-full border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-1 min-w-[300px] max-w-lg">
                <div className="relative flex-1 min-w-[120px]">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap ml-auto mr-100"
                >
                  <XMarkIcon className="h-6 w-6 mr-1" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Redemption Requests Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E8E8E8]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E8E8E8]">
                <thead className="bg-[#FA8630]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Owner Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Pet ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E8E8E8]">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-[#FA8630]/5 cursor-pointer"
                        onClick={() => openRequestProfile(request)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {request.petToRedeem.petId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {request.petToRedeem.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {request.requestDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
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
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No redemption requests matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Redemption Request Profile Modal */}
      {isProfileOpen && selectedRequest && (
        <RedemptionRequestProfile
          request={selectedRequest}
          onClose={closeRequestProfile}
        />
      )}
    </div>
  );
};

export default RedemptionRequest;
