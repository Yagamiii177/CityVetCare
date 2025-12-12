import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import NewReportModal from "../../components/ReportManagement/NewReportModal";
import { apiService } from "../../utils/api";
import {
  EyeIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const IncidentReportingManagement = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportSchedules, setReportSchedules] = useState([]); // Store schedules for selected report
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    Pending: 0,
    "In Progress": 0,
    Verified: 0,
    Resolved: 0
  });

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch reports from API with server-side search and pagination
  useEffect(() => {
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📥 Fetching incidents - Page:", currentPage, "Search:", searchTerm, "Status:", statusFilter);
      
      // Build query parameters for server-side filtering
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter.toLowerCase().replace(' ', '_') : undefined
      };
      
      const response = await apiService.incidents.getAll(params);
      console.log("✅ Received incidents:", response.data);
      
      // Update pagination state from server response
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
      }
      
      // Get status counts from separate API call (or from backend if available)
      await fetchStatusCounts();
      
      const activeReports = response.data.records;
      
      console.log("📊 All incidents (including all statuses):", activeReports.length);
      
      // Transform backend data to frontend format
      const transformedReports = activeReports.map(incident => ({
        id: incident.id,
        reporter: incident.reporter_name,
        reporterContact: incident.reporter_contact,
        type: incident.title,
        address: incident.location,
        date: incident.incident_date ? incident.incident_date.split(' ')[0] : incident.created_at.split(' ')[0],
        time: incident.incident_date ? incident.incident_date.split(' ')[1] : incident.created_at.split(' ')[1],
        status: incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' '),
        priority: incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1),
        description: incident.description,
        animalType: extractAnimalType(incident.description),
        animalCount: extractAnimalCount(incident.description),
        injuries: extractInjuries(incident.description),
        assignedTeam: incident.catcher_team_name || null,
        followUpRequired: true,
      }));

      console.log("✅ Reports transformed and ready:", transformedReports.length);
      setReports(transformedReports);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load reports. Please check your connection.");
      setReports([]);
      setLoading(false);
    }
  };

  // Fetch status counts separately
  const fetchStatusCounts = async () => {
    try {
      const response = await apiService.incidents.getStatusCounts();
      if (response.data.success) {
        const counts = {
          all: 0,
          Pending: 0,
          "In Progress": 0,
          Verified: 0,
          Resolved: 0
        };
        
        response.data.data.forEach(item => {
          const status = item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ');
          counts[status] = item.count;
          counts.all += item.count;
        });
        
        setStatusCounts(counts);
      }
    } catch (err) {
      console.error("Failed to fetch status counts:", err);
    }
  };

  // Handle search with debouncing
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper functions to extract data from description
  const extractAnimalType = (description) => {
    if (!description) return "Unknown";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('dog')) return 'Dog';
    if (lowerDesc.includes('cat')) return 'Cat';
    return 'Unknown';
  };

  const extractAnimalCount = (description) => {
    if (!description) return 1;
    const match = description.match(/(\d+)\s*(animal|dog|cat)/i);
    return match ? parseInt(match[1]) : 1;
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedReport) return;
    
    try {
      setIsUpdatingStatus(true);
      
      console.log("📤 Updating status for ID:", selectedReport.id, "to:", newStatus);
      
      // Prepare update data with all required fields
      const updateData = {
        id: selectedReport.id,
        title: selectedReport.type,
        description: selectedReport.description,
        location: selectedReport.address,
        latitude: null,
        longitude: null,
        status: newStatus.toLowerCase().replace(' ', '_'),
        priority: selectedReport.priority.toLowerCase(),
        assigned_catcher_id: null
      };
      
      console.log("📦 Update data:", updateData);
      
      // Update in backend
      const response = await apiService.incidents.update(selectedReport.id, updateData);
      console.log("✅ Backend updated:", response.data);
      
      // Wait a moment for database to commit
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh data from database to ensure consistency
      console.log("🔄 Refreshing reports from database...");
      await fetchReports();
      
      // Check if status is completed (resolved, rejected, cancelled)
      const completedStatuses = ['resolved', 'rejected', 'cancelled'];
      const isCompleted = completedStatuses.includes(newStatus.toLowerCase());
      
      setIsStatusModalOpen(false);
      setIsUpdatingStatus(false);
      
      if (isCompleted) {
        setSelectedReport(null);
        alert(`✅ Status updated to ${newStatus}!\n\nThis report has been moved to Report History.`);
      } else {
        // Find and update selected report with fresh data
        const updatedReport = reports.find(r => r.id === selectedReport.id);
        if (updatedReport) {
          setSelectedReport(updatedReport);
        }
        alert(`✅ Status updated to ${newStatus} successfully!\n\nThe table has been refreshed with the latest data.`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      console.error("Error details:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Failed to update status. Please try again.";
      alert(`❌ Failed to update status\n\n${errorMsg}`);
      setIsUpdatingStatus(false);
    }
  };

  const extractInjuries = (description) => {
    if (!description) return "None";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('bite') || lowerDesc.includes('injury') || lowerDesc.includes('wound')) {
      return description;
    }
    return "None";
  };

  // Fetch schedules for a specific incident
  const fetchReportSchedules = async (incidentId) => {
    try {
      const response = await apiService.patrolSchedules.getAll();
      const incidentSchedules = response.data.records.filter(
        schedule => schedule.incident_id === incidentId
      );
      setReportSchedules(incidentSchedules);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setReportSchedules([]);
    }
  };

  // Handle new report submission from modal
  const handleNewReportSubmit = async (newReportData) => {
    try {
      console.log("📤 Creating new incident from New Report modal...");
      
      // Prepare data for backend API
      const incidentData = {
        title: newReportData.type,
        description: `${newReportData.details}${newReportData.animalType ? '\n\nAnimal: ' + newReportData.animalType : ''}${newReportData.animalCount > 1 ? ' (' + newReportData.animalCount + ')' : ''}${newReportData.injuries ? '\nInjuries: ' + newReportData.injuries : ''}`,
        location: newReportData.location,
        status: 'pending',
        priority: newReportData.severity.toLowerCase(),
        reporter_name: newReportData.reporterName,
        reporter_contact: newReportData.reporterContact,
        incident_date: `${newReportData.date} ${newReportData.time}`,
      };

      console.log("📦 Incident data:", incidentData);

      // Send to backend
      const response = await apiService.incidents.create(incidentData);
      
      console.log("✅ SUCCESS! Incident created with ID:", response.data.id);

      // Show success message
      alert(`✅ Incident report submitted successfully!\n\nReport ID: ${response.data.id}\n\nThe report will now appear in the table.`);
      
      // Refresh the reports list to show new incident
      console.log("🔄 Refreshing reports list...");
      await fetchReports();
      console.log("✅ Reports list refreshed!");
      
    } catch (err) {
      console.error("❌ Error creating incident:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Failed to submit report. Please try again.";
      alert(`❌ Failed to submit report\n\n${errorMsg}\n\nCheck console (F12) for details.`);
    }
  };

  // Note: Filtering and sorting now handled by backend API
  // Reports are already filtered and paginated by the server
  const displayReports = reports;

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "Verified":
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case "In Progress":
        return <ExclamationTriangleIcon className="h-4 w-4 text-purple-500" />;
      case "Resolved":
        return <ClipboardDocumentListIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Verified: "bg-blue-100 text-blue-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Resolved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

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
              <h1 className="text-2xl font-bold text-gray-800">All Incident Reports</h1>
              <p className="text-gray-600">View all incident reports with any status</p>
              {error && (
                <p className="text-sm text-orange-600 mt-1">⚠️ {error}</p>
              )}
            </div>
            <button className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#E87928] transition-colors"
              onClick={() => setIsNewReportModalOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              New Report
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reports...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                        <p className="text-2xl font-bold text-gray-800">{count}</p>
                      </div>
                      {status !== "all" && getStatusIcon(status)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports (searches database: type, reporter, location, animal, team)..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => handleSearch("")}
                        className="absolute right-3 top-3"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                    {showFilters ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="Bite Incident">Bite Incident</option>
                        <option value="Stray Animal">Stray Animal</option>
                        <option value="Rabies Suspected">Rabies Suspected</option>
                        <option value="Animal Nuisance">Animal Nuisance</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <div className="flex gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        >
                          <option value="date">Date</option>
                          <option value="priority">Priority</option>
                          <option value="status">Status</option>
                          <option value="type">Type</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          {sortOrder === "asc" ? "A-Z" : "Z-A"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reports Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Incident Reports ({totalRecords})</h2>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"><DocumentArrowDownIcon className="h-4 w-4" />Export</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FA8630]/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Reporter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Type & Animal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Date/Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {displayReports.length ? (
                        displayReports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900">#{report.id}</span></td>
                            <td className="px-6 py-4"><div><p className="text-sm font-medium text-gray-900">{report.reporter}</p><p className="text-xs text-gray-500">{report.reporterContact}</p></div></td>
                            <td className="px-6 py-4"><div><p className="text-sm font-medium text-gray-900">{report.type}</p><p className="text-xs text-gray-500">{report.animalType} • {report.animalCount} animal(s)</p></div></td>
                            <td className="px-6 py-4"><p className="text-sm text-gray-900 max-w-xs truncate">{report.address}</p></td>
                            <td className="px-6 py-4"><div><p className="text-sm text-gray-900">{report.date}</p><p className="text-xs text-gray-500">{report.time}</p></div></td>
                            <td className="px-6 py-4">{getPriorityBadge(report.priority)}</td>
                            <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                            <td className="px-6 py-4"><div className="flex items-center gap-2"><button onClick={() => { setSelectedReport(report); fetchReportSchedules(report.id); }} className="text-[#FA8630] hover:text-[#E87928] p-1 rounded hover:bg-[#FA8630]/10 transition-colors" title="View Details"><EyeIcon className="h-5 w-5" /></button><button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors" title="Assign Team"><UserIcon className="h-5 w-5" /></button></div></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No reports found matching your criteria</p>
                              <button onClick={() => { handleSearch(""); handleStatusFilter("all"); setTypeFilter("all"); }} className="text-[#FA8630] hover:text-[#E87928] mt-2">Clear all filters</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                        <span className="font-semibold">{totalPages}</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>
                        <span className="font-semibold">{totalRecords}</span> total records
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNum = index + 1;
                          // Show first page, last page, current page, and pages around current
                          const showPage = 
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                          const showEllipsis = 
                            (pageNum === 2 && currentPage > 3) ||
                            (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return (
                              <span key={pageNum} className="px-2 py-1 text-gray-400">
                                ...
                              </span>
                            );
                          }

                          if (!showPage) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-[#FA8630] text-white'
                                  : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Report Details Modal */}
              {selectedReport && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
                    <button className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" onClick={() => setSelectedReport(null)}>
                      <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                    </button>

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-full bg-[#FA8630]/10"><ClipboardDocumentListIcon className="h-6 w-6 text-[#FA8630]" /></div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">Incident Report #{selectedReport.id}</h2>
                          <p className="text-gray-600">{selectedReport.type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                          <div className="flex items-center gap-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedReport.reporter}</p>
                              <p className="text-xs text-gray-500">{selectedReport.reporterContact}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedReport.date}</p>
                              <p className="text-xs text-gray-500">{selectedReport.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <div><p className="text-sm font-medium text-gray-900">{selectedReport.address}</p></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 border-b pb-2">Incident Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500">Status</p><div className="mt-1">{getStatusBadge(selectedReport.status)}</div></div>
                            <div><p className="text-xs text-gray-500">Priority</p><div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div></div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Animal Information</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedReport.animalType} • {selectedReport.animalCount} animal(s)</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Assigned Team</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedReport.assignedTeam || "Not assigned"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Follow-up Required</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedReport.followUpRequired ? "Yes" : "No"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Description</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedReport.description}</p>
                      </div>

                      {selectedReport.injuries && selectedReport.injuries !== "None" && (
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Injuries Reported</h3>
                          <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-100">{selectedReport.injuries}</p>
                        </div>
                      )}

                      {/* Patrol Schedule Table */}
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Patrol Schedule History</h3>
                        {reportSchedules.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Assigned Staff</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Schedule Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Created</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {reportSchedules.map((schedule) => (
                                  <tr key={schedule.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <div className="text-sm text-gray-900">
                                        {schedule.assigned_staff_names || "No staff assigned"}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="text-sm text-gray-900">
                                        {schedule.schedule_date ? new Date(schedule.schedule_date).toLocaleString() : "N/A"}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        schedule.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {schedule.status.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                      {new Date(schedule.created_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No patrol schedules yet</p>
                            <p className="text-xs text-gray-500 mt-1">Schedules will appear here when created</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button 
                          onClick={() => setIsStatusModalOpen(true)}
                          className="flex-1 bg-[#FA8630] text-white py-2 px-4 rounded-lg hover:bg-[#E87928] transition-colors"
                        >
                          Update Status
                        </button>
                        <button className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">Assign Team</button>
                        <button className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">Add Note</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Update Report Status</h3>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Select the new status for Report #{selectedReport?.id}
              </p>
              
              <div className="space-y-2">
                {['Pending', 'Verified', 'In Progress', 'Resolved', 'Rejected', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={selectedReport?.status === status || isUpdatingStatus}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      selectedReport?.status === status
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                        : 'border-gray-200 hover:border-[#FA8630] hover:bg-[#FA8630]/5 cursor-pointer'
                    } ${isUpdatingStatus ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{status}</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                        {selectedReport?.status === status && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {isUpdatingStatus && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[#FA8630]">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FA8630]"></div>
                  <span className="text-sm">Updating status...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onSubmit={handleNewReportSubmit}
      />
    </div>
  );
};

export default IncidentReportingManagement;