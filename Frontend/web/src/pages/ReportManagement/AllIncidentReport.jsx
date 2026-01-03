import { useState, useEffect, useCallback, useRef } from "react";
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
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // Data State
  const [reports, setReports] = useState([]);
  const [reportSchedules, setReportSchedules] = useState([]);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Status Counts
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    Pending: 0,
    "In Progress": 0,
    Verified: 0,
    Resolved: 0
  });
  
  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Refs for cleanup
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Toggle drawer
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Helper functions to extract data from description
  const extractAnimalType = useCallback((description) => {
    if (!description) return "Unknown";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('dog')) return 'Dog';
    if (lowerDesc.includes('cat')) return 'Cat';
    if (lowerDesc.includes('bird')) return 'Bird';
    if (lowerDesc.includes('reptile') || lowerDesc.includes('snake')) return 'Reptile';
    return 'Unknown';
  }, []);

  const extractAnimalCount = useCallback((description) => {
    if (!description) return 1;
    const match = description.match(/(\d+)\s*(animal|dog|cat|bird)/i);
    return match ? parseInt(match[1], 10) : 1;
  }, []);

  const extractInjuries = useCallback((description) => {
    if (!description) return "None";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('bite') || lowerDesc.includes('injury') || 
        lowerDesc.includes('wound') || lowerDesc.includes('hurt')) {
      return description;
    }
    return "None";
  }, []);

  // Transform backend incident data to frontend format
  const transformIncident = useCallback((incident) => {
    const getDateTime = (dateTimeStr, fallback) => {
      const [date, time] = (dateTimeStr || fallback || '').split(' ');
      return { date: date || 'N/A', time: time || 'N/A' };
    };

    const { date, time } = getDateTime(incident.incident_date, incident.created_at);
    const capitalizeStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    return {
      id: incident.id,
      reporter: incident.reporter_name || 'Unknown',
      reporterContact: incident.reporter_contact || 'N/A',
      type: incident.title || 'Unknown Incident',
      address: incident.location || 'Location not provided',
      date,
      time,
      status: capitalizeStatus(incident.status || 'pending'),
      priority: capitalizeStatus(incident.priority || 'medium'),
      description: incident.description || 'No description available',
      animalType: extractAnimalType(incident.description),
      animalCount: extractAnimalCount(incident.description),
      injuries: extractInjuries(incident.description),
      assignedTeam: incident.catcher_team_name || null,
      followUpRequired: incident.follow_up_required ?? true,
      latitude: incident.latitude,
      longitude: incident.longitude,
    };
  }, [extractAnimalType, extractAnimalCount, extractInjuries]);

  // Fetch status counts separately
  const fetchStatusCounts = useCallback(async () => {
    try {
      const response = await apiService.incidents.getStatusCounts();
      
      if (!isMountedRef.current) return;
      
      if (response.data.success) {
        const counts = {
          all: 0,
          Pending: 0,
          "In Progress": 0,
          Verified: 0,
          Resolved: 0
        };
        
        const data = response.data.data || [];
        data.forEach(item => {
          const status = item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ');
          counts[status] = item.count || 0;
          counts.all += item.count || 0;
        });
        
        if (isMountedRef.current) {
          setStatusCounts(counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch status counts:", err);
      // Don't set error state, as this is not critical
    }
  }, []);

  // Fetch reports from API with server-side search and pagination
  const fetchReports = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      console.log("📥 Fetching incidents - Page:", currentPage, "Search:", debouncedSearchTerm, "Status:", statusFilter);
      
      // Build query parameters for server-side filtering
      const params = {
        page: currentPage,
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter.toLowerCase().replace(' ', '_') : undefined
      };
      
      const response = await apiService.incidents.getAll(params);
      
      if (!isMountedRef.current) return;
      
      console.log("✅ Received incidents:", response.data);
      
      // Update pagination state from server response
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalRecords(response.data.pagination.total || 0);
        setCurrentPage(response.data.pagination.page || 1);
      }
      
      // Get status counts from separate API call
      await fetchStatusCounts();
      
      const activeReports = response.data.records || [];
      
      console.log("📊 All incidents (including all statuses):", activeReports.length);
      
      // Transform backend data to frontend format
      const transformedReports = activeReports.map(transformIncident);

      console.log("✅ Reports transformed and ready:", transformedReports.length);
      
      if (isMountedRef.current) {
        setReports(transformedReports);
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      console.error("Error details:", err.response?.data);
      
      if (isMountedRef.current) {
        setError(
          err.response?.data?.message || 
          err.message || 
          "Failed to load reports. Please check your connection and try again."
        );
        setReports([]);
        setLoading(false);
      }
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, transformIncident, fetchStatusCounts]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  // Handle status filter change
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // Handle page navigation
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (newStatus) => {
    if (!selectedReport || !newStatus) {
      console.error("Missing selected report or new status");
      return;
    }
    
    try {
      setIsUpdatingStatus(true);
      
      console.log("📤 Updating status for ID:", selectedReport.id, "to:", newStatus);
      
      // Prepare update data with all required fields
      const updateData = {
        id: selectedReport.id,
        title: selectedReport.type,
        description: selectedReport.description,
        location: selectedReport.address,
        latitude: selectedReport.latitude || null,
        longitude: selectedReport.longitude || null,
        status: newStatus.toLowerCase().replace(' ', '_'),
        priority: selectedReport.priority.toLowerCase(),
        assigned_catcher_id: null,
        reporter_name: selectedReport.reporter,
        reporter_contact: selectedReport.reporterContact,
      };
      
      console.log("📦 Update data:", updateData);
      
      // Update in backend
      const response = await apiService.incidents.update(selectedReport.id, updateData);
      console.log("✅ Backend updated:", response.data);
      
      if (!isMountedRef.current) return;
      
      // Wait a moment for database to commit
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh data from database to ensure consistency
      console.log("🔄 Refreshing reports from database...");
      await fetchReports();
      
      if (!isMountedRef.current) return;
      
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
      
      if (isMountedRef.current) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to update status. Please try again.";
        alert(`❌ Failed to update status\n\n${errorMsg}`);
        setIsUpdatingStatus(false);
      }
    }
  }, [selectedReport, reports, fetchReports]);

  // Fetch schedules for a specific incident
  const fetchReportSchedules = useCallback(async (incidentId) => {
    if (!incidentId) {
      console.warn("No incident ID provided for fetching schedules");
      setReportSchedules([]);
      return;
    }
    
    try {
      const response = await apiService.patrolSchedules.getAll();
      
      if (!isMountedRef.current) return;
      
      const records = response.data.records || [];
      const incidentSchedules = records.filter(
        schedule => schedule.incident_id === incidentId
      );
      
      if (isMountedRef.current) {
        setReportSchedules(incidentSchedules);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
      if (isMountedRef.current) {
        setReportSchedules([]);
      }
    }
  }, []);

  // Handle new report submission from modal
  const handleNewReportSubmit = useCallback(async (newReportData) => {
    if (!newReportData) {
      console.error("No report data provided");
      alert("❌ Failed to submit report\n\nNo data provided.");
      return;
    }
    
    try {
      console.log("📤 Creating new incident from New Report modal...");
      
      // Prepare data for backend API
      const incidentData = {
        title: newReportData.type || 'Unknown Incident',
        description: `${newReportData.details || 'No details provided'}${newReportData.animalType ? '\n\nAnimal: ' + newReportData.animalType : ''}${newReportData.animalCount > 1 ? ' (' + newReportData.animalCount + ')' : ''}${newReportData.injuries ? '\nInjuries: ' + newReportData.injuries : ''}`,
        location: newReportData.location || 'Location not provided',
        status: 'pending',
        priority: (newReportData.severity || 'medium').toLowerCase(),
        reporter_name: newReportData.reporterName || 'Anonymous',
        reporter_contact: newReportData.reporterContact || 'N/A',
        incident_date: `${newReportData.date || new Date().toISOString().split('T')[0]} ${newReportData.time || '00:00:00'}`,
      };

      console.log("📦 Incident data:", incidentData);

      // Send to backend
      const response = await apiService.incidents.create(incidentData);
      
      if (!isMountedRef.current) return;
      
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
      
      if (isMountedRef.current) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to submit report. Please try again.";
        alert(`❌ Failed to submit report\n\n${errorMsg}\n\nCheck console (F12) for details.`);
      }
    }
  }, [fetchReports]);

  // Get status icon for display
  const getStatusIcon = useCallback((status) => {
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
  }, []);

  const getPriorityBadge = useCallback((priority) => {
    const styles = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || styles.Medium}`}>
        {priority}
      </span>
    );
  }, []);

  const getStatusBadge = useCallback((status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Verified: "bg-blue-100 text-blue-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Resolved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Pending}`}>
        {status}
      </span>
    );
  }, []);

  // View report details
  const handleViewReport = useCallback((report) => {
    setSelectedReport(report);
    fetchReportSchedules(report.id);
  }, [fetchReportSchedules]);

  // Close report details modal
  const handleCloseReportDetails = useCallback(() => {
    setSelectedReport(null);
    setReportSchedules([]);
  }, []);

  // Fetch reports when dependencies change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    <button 
                      onClick={fetchReports}
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
              onClick={() => setIsNewReportModalOpen(true)}
              disabled={loading}
              aria-label="Create new report"
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
                    <label htmlFor="search-input" className="sr-only">Search reports</label>
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search reports (searches database: type, reporter, location, animal, team)..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      aria-label="Search reports by type, reporter, location, animal, or team"
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
                    {showFilters ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div id="filter-panel" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    {/* Status Filter */}
                    <div>
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        aria-label="Filter by status"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Info text */}
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Sorting and type filtering are handled server-side.
                        Use the search bar to filter by type, reporter, location, or animal.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reports Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Incident Reports ({totalRecords})</h2>
                  <button 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={reports.length === 0}
                    aria-label="Export reports"
                    title="Export reports to CSV"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Export
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Incident reports">
                    <caption className="sr-only">List of incident reports with details and actions</caption>
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
                      {reports.length ? (
                        reports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900">#{report.id}</span></td>
                            <td className="px-6 py-4"><div><p className="text-sm font-medium text-gray-900">{report.reporter}</p><p className="text-xs text-gray-500">{report.reporterContact}</p></div></td>
                            <td className="px-6 py-4"><div><p className="text-sm font-medium text-gray-900">{report.type}</p><p className="text-xs text-gray-500">{report.animalType} • {report.animalCount} animal(s)</p></div></td>
                            <td className="px-6 py-4"><p className="text-sm text-gray-900 max-w-xs truncate" title={report.address}>{report.address}</p></td>
                            <td className="px-6 py-4"><div><p className="text-sm text-gray-900">{report.date}</p><p className="text-xs text-gray-500">{report.time}</p></div></td>
                            <td className="px-6 py-4">{getPriorityBadge(report.priority)}</td>
                            <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleViewReport(report)} 
                                  className="text-[#FA8630] hover:text-[#E87928] p-1 rounded hover:bg-[#FA8630]/10 transition-colors" 
                                  title="View Details"
                                  aria-label={`View details for report ${report.id}`}
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors" 
                                  title="Assign Team"
                                  aria-label={`Assign team to report ${report.id}`}
                                >
                                  <UserIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No reports found matching your criteria</p>
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
                    <button 
                      className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" 
                      onClick={handleCloseReportDetails}
                      aria-label="Close modal"
                    >
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

// Display name for debugging
IncidentReportingManagement.displayName = 'IncidentReportingManagement';