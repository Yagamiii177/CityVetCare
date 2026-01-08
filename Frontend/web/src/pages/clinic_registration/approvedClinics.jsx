import { useState, useEffect, useCallback, useMemo } from "react";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
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
} from "@heroicons/react/24/outline";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/clinic_registration/drawer";
import ViewClinic from "../../components/clinic_registration/clinic_list/viewClinic";
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

const ApprovedClinics = () => {
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Data State
  const [clinics, setClinics] = useState([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

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
      const response = await apiService.clinics.getAll({ status: "Active" });
      setClinics(response.data || []);
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError("Failed to load approved clinics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: clinics.length,
      Active: 0,
      Pending: 0,
      Inactive: 0,
      Suspended: 0,
    };

    clinics.forEach((clinic) => {
      if (Object.prototype.hasOwnProperty.call(counts, clinic.status)) {
        counts[clinic.status]++;
      }
    });

    return counts;
  }, [clinics]);

  // Filter clinics
  const filteredClinics = useMemo(() => {
    let filtered = [...clinics];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((clinic) => clinic.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(term) ||
          clinic.email.toLowerCase().includes(term) ||
          clinic.phone.includes(term) ||
          clinic.address.toLowerCase().includes(term) ||
          clinic.veterinarian.toLowerCase().includes(term) ||
          clinic.licenseNumber.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [clinics, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Handle status filter change
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("Active");
  }, []);

  // View clinic details
  const handleViewClinic = useCallback((clinic) => {
    setSelectedClinic(clinic);
  }, []);

  // Close clinic details modal
  const handleCloseClinicDetails = useCallback(() => {
    setSelectedClinic(null);
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
              <h1 className="text-2xl font-bold text-gray-800">
                Approved Clinics
              </h1>
              <p className="text-gray-600">
                View and manage approved veterinary clinics
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
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading approved clinics...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`bg-white p-4 rounded-lg shadow-sm border-2 transition-all text-left ${
                      statusFilter === status
                        ? "border-[#FA8630] bg-[#FA8630]/5"
                        : "border-gray-200 hover:border-[#FA8630]/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {status}
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {count}
                        </p>
                      </div>
                      {status !== "all" && getStatusIcon(status)}
                    </div>
                  </button>
                ))}
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
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200"
                  >
                    {/* Status Filter */}
                    <div>
                      <label
                        htmlFor="status-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Status
                      </label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        aria-label="Filter by status"
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>

                    {/* Info text */}
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Use the search bar to filter by
                        name, email, phone, veterinarian, or license number.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinics Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Approved Clinics ({filteredClinics.length})
                  </h2>
                  <button
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    aria-label="Approved clinics"
                  >
                    <caption className="sr-only">
                      List of approved veterinary clinics with details and
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
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <BuildingOffice2Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>
                                No approved clinics found matching your criteria
                              </p>
                              <button
                                onClick={clearFilters}
                                className="text-[#FA8630] hover:text-[#E87928] mt-2 underline"
                              >
                                Clear all filters
                              </button>
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
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApprovedClinics;
