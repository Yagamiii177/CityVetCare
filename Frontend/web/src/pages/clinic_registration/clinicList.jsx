import { useState, useEffect, useCallback, useMemo } from "react";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/clinic_registration/drawer";
import NewClinic from "../../components/clinic_registration/clinic_list/newClinic";
import ViewClinic from "../../components/clinic_registration/clinic_list/viewClinic";
import InactiveClinic from "../../components/clinic_registration/clinic_list/inactiveClinic";
import { apiService } from "../../utils/api";

const getStatusIcon = (status) => {
  switch (status) {
    case "Active":
      return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
    case "Pending":
      return <ClockIcon className="h-6 w-6 text-yellow-600" />;
    case "Inactive":
      return <XCircleIcon className="h-6 w-6 text-gray-600" />;
    case "Suspended":
      return <XCircleIcon className="h-6 w-6 text-red-600" />;
    default:
      return <ClockIcon className="h-6 w-6 text-gray-600" />;
  }
};

const getStatusBadge = (status) => {
  const styles = {
    Active: "bg-green-50 text-green-700 border border-green-200",
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Inactive: "bg-gray-50 text-gray-700 border border-gray-200",
    Suspended: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
};

const ClinicManagement = () => {
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isNewClinicOpen, setIsNewClinicOpen] = useState(false);
  const [inactiveClinic, setInactiveClinic] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Data State
  const [clinics, setClinics] = useState([]);

  // Filter State - Using view mode instead of status filter
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("pending"); // 'all', 'pending', 'approved', 'inactive', 'suspended'

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle drawer
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.clinics.getAll();
      setClinics(response.data || []);
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError("Failed to load clinics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate status counts based on current data
  const statusCounts = useMemo(() => {
    return {
      all: clinics.length,
      pending: clinics.filter((c) => c.status === "Pending").length,
      approved: clinics.filter((c) => c.status === "Active").length,
      inactive: clinics.filter((c) => c.status === "Inactive").length,
      suspended: clinics.filter((c) => c.status === "Suspended").length,
    };
  }, [clinics]);

  // Filter clinics based on view mode
  const filteredClinics = useMemo(() => {
    let filtered = [...clinics];

    // View mode filter
    switch (viewMode) {
      case "pending":
        filtered = filtered.filter((clinic) => clinic.status === "Pending");
        break;
      case "approved":
        filtered = filtered.filter((clinic) => clinic.status === "Active");
        break;
      case "inactive":
        filtered = filtered.filter((clinic) => clinic.status === "Inactive");
        break;
      case "suspended":
        filtered = filtered.filter((clinic) => clinic.status === "Suspended");
        break;
      case "all":
      default:
        // Show all clinics
        break;
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((clinic) => {
        const name = (clinic.name || "").toLowerCase();
        const email = (clinic.email || "").toLowerCase();
        const phone = clinic.phone || "";
        const address = (clinic.address || "").toLowerCase();
        const vet = (clinic.veterinarian || "").toLowerCase();
        const license = (clinic.licenseNumber || "").toLowerCase();

        return (
          name.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          address.includes(term) ||
          vet.includes(term) ||
          license.includes(term)
        );
      });
    }

    return filtered;
  }, [clinics, searchTerm, viewMode]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
  }, []);

  // View clinic details
  const handleViewClinic = useCallback((clinic) => {
    setSelectedClinic(clinic);
  }, []);

  // Close clinic details modal
  const handleCloseClinicDetails = useCallback(() => {
    setSelectedClinic(null);
  }, []);

  // Handle clinic approval
  const handleClinicApproved = useCallback((approvedClinic) => {
    // Update the clinic in the list with new status
    setClinics((prev) =>
      prev.map((clinic) =>
        clinic.id === approvedClinic.id ? approvedClinic : clinic
      )
    );
    setSelectedClinic(null);
  }, []);

  // Handle new clinic creation
  const handleCreateClinic = useCallback(async (newClinicData) => {
    try {
      const response = await apiService.clinics.create(newClinicData);
      setClinics((prev) => [response.data, ...prev]);
      setIsNewClinicOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error creating clinic:", err);
      setError("Failed to register clinic. Please try again.");
    }
  }, []);

  // Handle inactive clinic
  const handleInactiveClinic = useCallback((clinic) => {
    setInactiveClinic(clinic);
  }, []);

  // Handle suspend clinic (same modal, different action)
  const handleSuspendClinic = useCallback((clinic) => {
    setInactiveClinic(clinic);
  }, []);

  // Handle close inactive modal
  const handleCloseInactive = useCallback(() => {
    setInactiveClinic(null);
  }, []);

  // Handle clinic status change
  const handleStatusChange = useCallback((updatedClinic) => {
    setClinics((prev) =>
      prev.map((clinic) =>
        clinic.id === updatedClinic.id ? updatedClinic : clinic
      )
    );
    setInactiveClinic(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      {/* Header */}
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "City Vet Staff" }}
      />

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-8 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Clinic Management
              </h1>
              <p className="text-gray-600">
                Manage and review veterinary clinic registrations
              </p>
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    <button
                      onClick={fetchClinics}
                      className="text-xs text-red-700 hover:text-red-900 underline mt-1"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#E87928] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsNewClinicOpen(true)}
              disabled={loading}
              aria-label="Register new clinic"
            >
              <PlusIcon className="h-5 w-5" />
              New Clinic
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading clinics...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Segmented Control for View Mode */}
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex gap-1">
                <button
                  onClick={() => handleViewModeChange("pending")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "pending"
                      ? "bg-[#FA8630] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Pending Approval</span>
                    {statusCounts.pending > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          viewMode === "pending"
                            ? "bg-white/20 text-white"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {statusCounts.pending}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleViewModeChange("approved")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "approved"
                      ? "bg-[#FA8630] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approved Clinics</span>
                    {statusCounts.approved > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          viewMode === "approved"
                            ? "bg-white/20 text-white"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {statusCounts.approved}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleViewModeChange("inactive")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "inactive"
                      ? "bg-[#FA8630] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MinusCircleIcon className="h-4 w-4" />
                    <span>Inactive</span>
                    {statusCounts.inactive > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          viewMode === "inactive"
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusCounts.inactive}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleViewModeChange("suspended")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "suspended"
                      ? "bg-[#FA8630] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StopIcon className="h-4 w-4" />
                    <span>Suspended</span>
                    {statusCounts.suspended > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          viewMode === "suspended"
                            ? "bg-white/20 text-white"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {statusCounts.suspended}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleViewModeChange("all")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "all"
                      ? "bg-[#FA8630] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BuildingOffice2Icon className="h-4 w-4" />
                    <span>All Clinics</span>
                    {statusCounts.all > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          viewMode === "all"
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {statusCounts.all}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <label htmlFor="search-input" className="sr-only">
                      Search clinics
                    </label>
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search clinics (name, email, phone, veterinarian, license)..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      aria-label="Search clinics by name, email, phone, veterinarian, or license"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => handleSearch("")}
                        className="absolute right-3 top-3"
                        aria-label="Clear search"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                    {showFilters ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div
                    id="filter-panel"
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <p className="text-sm text-gray-600">
                      <strong>Tip:</strong> Use the search bar to quickly find
                      clinics by name, email, phone, veterinarian, or license
                      number. Switch between tabs above to filter by approval
                      status.
                    </p>
                  </div>
                )}
              </div>

              {/* Clinics Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {viewMode === "pending" && "Pending Approval"}
                      {viewMode === "approved" && "Approved Clinics"}
                      {viewMode === "inactive" && "Inactive Clinics"}
                      {viewMode === "suspended" && "Suspended Clinics"}
                      {viewMode === "all" && "All Registered Clinics"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredClinics.length}{" "}
                      {filteredClinics.length === 1 ? "clinic" : "clinics"}{" "}
                      found
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={filteredClinics.length === 0}
                    aria-label="Export clinics"
                    title="Export clinics to CSV"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Export
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    role="table"
                    aria-label="Clinic registrations"
                  >
                    <caption className="sr-only">
                      List of veterinary clinic registrations with details and
                      actions
                    </caption>
                    <thead className="bg-[#FA8630]/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Clinic Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Veterinarian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Working Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          License
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filteredClinics.length ? (
                        filteredClinics.map((clinic) => (
                          <tr
                            key={clinic.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                #{clinic.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {clinic.name}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {clinic.address}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                {clinic.veterinarian}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900 flex items-center gap-1">
                                  <PhoneIcon className="h-3 w-3" />
                                  {clinic.phone}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <EnvelopeIcon className="h-3 w-3" />
                                  {clinic.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {clinic.workingHours &&
                              clinic.workingHours.days &&
                              clinic.workingHours.openingTime &&
                              clinic.workingHours.closingTime ? (
                                <div className="text-sm text-gray-900">
                                  <p className="font-medium">
                                    {clinic.workingHours.days}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {clinic.workingHours.openingTime} -{" "}
                                    {clinic.workingHours.closingTime}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  Not set
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                {clinic.licenseNumber}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(clinic.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewClinic(clinic)}
                                  className="text-[#FA8630] hover:text-[#E87928] p-1 rounded hover:bg-[#FA8630]/10 transition-colors"
                                  title="View Details"
                                  aria-label={`View details for clinic ${clinic.id}`}
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <BuildingOffice2Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                              <p className="text-lg font-medium text-gray-700 mb-1">
                                No clinics found
                              </p>
                              <p className="text-sm text-gray-500 mb-4">
                                {searchTerm
                                  ? "Try adjusting your search terms"
                                  : viewMode === "pending"
                                  ? "There are no clinics pending approval"
                                  : viewMode === "approved"
                                  ? "There are no approved clinics yet"
                                  : viewMode === "inactive"
                                  ? "There are no inactive clinics"
                                  : viewMode === "suspended"
                                  ? "There are no suspended clinics"
                                  : "No clinic registrations found"}
                              </p>
                              {searchTerm && (
                                <button
                                  onClick={clearFilters}
                                  className="text-[#FA8630] hover:text-[#E87928] font-medium underline"
                                >
                                  Clear search
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clinic Details Modal */}
              {selectedClinic && (
                <ViewClinic
                  clinic={selectedClinic}
                  onClose={handleCloseClinicDetails}
                  onApprove={handleClinicApproved}
                  onStatusChange={handleStatusChange}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* New Clinic Modal */}
      {isNewClinicOpen && (
        <NewClinic
          isOpen={isNewClinicOpen}
          onClose={() => setIsNewClinicOpen(false)}
          onCreate={handleCreateClinic}
        />
      )}

      {/* Inactive Clinic Modal */}
      {inactiveClinic && (
        <InactiveClinic
          clinic={inactiveClinic}
          isOpen={true}
          onClose={handleCloseInactive}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default ClinicManagement;
