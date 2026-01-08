import { useEffect, useState, useCallback } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AdoptionProfile from "../../components/StrayAnimalManagement/AdoptionList/AdoptionProfile";
import { apiService } from "../../utils/api";

const AdoptionList = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | rejected | archived
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAdoptionRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.adoptionRequests.list();
      const requests = response?.data?.data || response?.data || [];
      setAdoptionRequests(requests);
    } catch (err) {
      console.error("Failed to load adoption requests:", err);
      setError("Unable to load adoption requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdoptionRequests();
  }, [loadAdoptionRequests]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const clearSearch = () => setSearchTerm("");

  const openRequestProfile = (request) => {
    setSelectedRequest(request);
    setIsProfileOpen(true);
  };

  const closeRequestProfile = () => {
    setIsProfileOpen(false);
    setSelectedRequest(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = normalizeStatus(status);
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const normalizeStatus = (status) => {
    const s = (status || "").toLowerCase();
    if (["approved", "accept", "accepted", "approve"].includes(s))
      return "approved";
    if (["rejected", "declined", "decline"].includes(s)) return "rejected";
    if (["archived", "archive"].includes(s)) return "archived";
    if (["pending", "submitted", "new"].includes(s)) return "pending";
    return s || "pending";
  };

  const getDisplayStatus = (status) => {
    const s = normalizeStatus(status);
    if (s === "approved") return "APPROVED";
    return s.toUpperCase();
  };

  const tabButtonClass = (tab) =>
    `px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
      activeTab === tab
        ? "bg-[#FA8630] text-white border-[#FA8630] shadow-sm"
        : "bg-white text-gray-700 border-[#E8E8E8] hover:bg-gray-50"
    }`;

  const filteredRequests = adoptionRequests.filter((request) => {
    if (!request) return false;

    const tabMatches = normalizeStatus(request.status) === activeTab;
    if (!tabMatches) return false;

    const matchesSearch =
      searchTerm === "" ||
      request.adopter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.animal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(request.stray_id || "").includes(searchTerm) ||
      String(request.adoption_id || "").includes(searchTerm);

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Admin - CityVetCare" }}
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
            <h1 className="text-2xl font-bold">Pet Adoption Requests</h1>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              className={tabButtonClass("pending")}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={tabButtonClass("approved")}
              onClick={() => setActiveTab("approved")}
            >
              Approved
            </button>
            <button
              type="button"
              className={tabButtonClass("rejected")}
              onClick={() => setActiveTab("rejected")}
            >
              Rejected
            </button>
            <button
              type="button"
              className={tabButtonClass("archived")}
              onClick={() => setActiveTab("archived")}
            >
              Archive
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px] max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by adopter, animal, or ID"
                  className="pl-10 pr-4 py-2 w-full border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="-mt-2 pb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 pb-8 overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8] table-fixed">
                  <thead className="bg-[#FA8630]/10 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[110px]">
                        Request ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[100px]">
                        Stray ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[180px]">
                        Adopter Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[220px]">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[160px]">
                        Stray Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[120px]">
                        Species
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[140px]">
                        Breed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[150px]">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[130px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E8E8E8]">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Loading adoption requests...
                        </td>
                      </tr>
                    ) : filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr
                          key={request.adoption_id}
                          className="hover:bg-[#FA8630]/5 cursor-pointer"
                          onClick={() => openRequestProfile(request)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            #{request.adoption_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                            #{request.stray_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.adopter_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {request.adopter_email || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.animal_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.species || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {request.breed || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(request.request_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                request.status
                              )}`}
                            >
                              {getDisplayStatus(request.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          {searchTerm
                            ? "No adoption requests matching your search"
                            : "No adoption requests found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Adoption Request Profile Modal */}
      {isProfileOpen && selectedRequest && (
        <AdoptionProfile
          request={selectedRequest}
          onClose={closeRequestProfile}
          onUpdate={loadAdoptionRequests}
          isArchiveView={activeTab === "archived"}
        />
      )}
    </div>
  );
};

export default AdoptionList;
