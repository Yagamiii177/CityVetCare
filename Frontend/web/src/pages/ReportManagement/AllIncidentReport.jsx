import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import NewReportModal from "../../components/ReportManagement/NewReportModal";
import { NotificationModal } from "../../components/ReportManagement/Modal";
import { apiService, getImageUrl } from "../../utils/api";
import FrontendLogger from "../../utils/logger";

const logger = new FrontendLogger('INCIDENT-REPORT');
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
  
  // Modal state
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  
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
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Helper function to extract animal count from description
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
      try {
        const dateString = dateTimeStr || fallback || '';
        if (!dateString) return { date: 'Not specified', time: 'Not specified' };
        
        // Parse datetime - could be MySQL datetime (YYYY-MM-DD HH:MM:SS) or ISO format
        const dateObj = new Date(dateString);
        
        if (isNaN(dateObj.getTime())) {
          // If date parsing failed, try splitting by space
          const parts = dateString.split(' ');
          if (parts.length >= 2) {
            return { date: parts[0], time: parts[1] };
          }
          return { date: dateString, time: 'Not specified' };
        }
        
        // Format date as YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        
        // Format time as HH:MM:SS
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        
        return { date, time };
      } catch (error) {
        console.error('Error parsing date/time:', error);
        return { date: 'Not specified', time: 'Not specified' };
      }
    };

    const { date, time } = getDateTime(incident.incident_date, incident.created_at);
    const capitalizeStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    // Format report type from database
    const formatReportType = (type) => {
      // Handle empty strings and null/undefined
      if (!type || type === '') return 'Incident/Bite Report';
      if (type === 'incident') return 'Incident/Bite Report';
      if (type === 'stray') return 'Stray Animal Report';
      if (type === 'lost') return 'Lost Pet Report';
      return 'Animal Report';
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
      description: incident.description || 'No description available',
      images: incident.images || [], // Add images field
      // NEW: Use actual database fields instead of parsing description
      reportType: formatReportType(incident.incident_type),
      animalType: incident.animal_type ? capitalizeStatus(incident.animal_type) : 'Unknown',
      petBreed: incident.pet_breed || 'Not specified',
      petColor: incident.pet_color || 'Not specified',
      petGender: incident.pet_gender ? capitalizeStatus(incident.pet_gender) : 'Unknown',
      petSize: incident.pet_size ? capitalizeStatus(incident.pet_size) : 'Unknown',
      // Keep old fields for backwards compatibility
      animalCount: extractAnimalCount(incident.description),
      injuries: extractInjuries(incident.description),
      assignedTeam: incident.assigned_team || null,
      followUpRequired: incident.follow_up_required ?? true,
      latitude: incident.latitude,
      longitude: incident.longitude,
    };
  }, [extractAnimalCount, extractInjuries]);

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
        
        const data = response.data.data || {};
        // Handle object format {total: 3, pending: 3, verified: 0, ...}
        counts.all = data.total || 0;
        counts.Pending = data.pending || 0;
        counts["In Progress"] = data.in_progress || data['in_progress'] || 0;
        counts.Verified = data.verified || 0;
        counts.Resolved = data.resolved || 0;
        
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
      
      logger.debug('Fetching incidents', { currentPage, search: debouncedSearchTerm, status: statusFilter });
      
      // Build query parameters for server-side filtering
      // Note: Backend expects status in Title Case with spaces (e.g., "In Progress")
      const params = {
        page: currentPage,
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined  // Send status as-is (Title Case with spaces)
      };
      
      const response = await apiService.incidents.getAll(params);
      
      if (!isMountedRef.current) return;
      
      logger.debug('Received incidents', response.data);
      
      // Update pagination state from server response
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalRecords(response.data.pagination.total || 0);
        setCurrentPage(response.data.pagination.page || 1);
      }
      
      // Get status counts from separate API call
      await fetchStatusCounts();
      
      const activeReports = response.data.records || [];
      
      // Transform backend data to frontend format
      const transformedReports = activeReports.map(transformIncident);
      
      if (isMountedRef.current) {
        setReports(transformedReports);
        setLoading(false);
      }
    } catch (err) {
      logger.error('Error fetching reports:', err.response?.data || err.message);
      
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
      logger.error('Missing selected report or new status');
      return;
    }
    
    try {
      setIsUpdatingStatus(true);
      
      logger.debug('Updating status', { id: selectedReport.id, newStatus });
      
      // Prepare update data with all required fields
      // Note: Backend expects status in Title Case with spaces (e.g., "In Progress", not "in_progress")
      const updateData = {
        id: selectedReport.id,
        title: selectedReport.type,
        description: selectedReport.description,
        location: selectedReport.address,
        latitude: selectedReport.latitude || null,
        longitude: selectedReport.longitude || null,
        status: newStatus, // Send status as-is (Title Case with spaces)
        assigned_catcher_id: null,
        reporter_name: selectedReport.reporter,
        reporter_contact: selectedReport.reporterContact,
      };
      
      // Update in backend
      await apiService.incidents.update(selectedReport.id, updateData);
      
      if (!isMountedRef.current) return;
      
      // Wait a moment for database to commit
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh data from database to ensure consistency
      logger.debug('Refreshing reports from database');
      await fetchReports();
      
      if (!isMountedRef.current) return;
      
      // Check if status is completed (resolved, rejected, cancelled)
      const completedStatuses = ['resolved', 'rejected', 'cancelled'];
      const isCompleted = completedStatuses.includes(newStatus.toLowerCase());
      
      setIsStatusModalOpen(false);
      setIsUpdatingStatus(false);
      
      if (isCompleted) {
        setSelectedReport(null);
        setNotificationModal({
          isOpen: true,
          title: 'Status Updated',
          message: `Status updated to ${newStatus}!\n\nThis report has been moved to Report History.`,
          type: 'success'
        });
      } else {
        // Find and update selected report with fresh data
        const updatedReport = reports.find(r => r.id === selectedReport.id);
        if (updatedReport) {
          setSelectedReport(updatedReport);
        }
        setNotificationModal({
          isOpen: true,
          title: 'Success',
          message: `Status updated to ${newStatus} successfully!\n\nThe table has been refreshed with the latest data.`,
          type: 'success'
        });
      }
    } catch (err) {
      logger.error('Error updating status:', err.response?.data || err.message);
      
      if (isMountedRef.current) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to update status. Please try again.";
        setNotificationModal({
          isOpen: true,
          title: 'Error',
          message: `Failed to update status\n\n${errorMsg}`,
          type: 'error'
        });
        setIsUpdatingStatus(false);
      }
    }
  }, [selectedReport, reports, fetchReports]);

  // Fetch schedules for a specific incident
  const fetchReportSchedules = useCallback(async (incidentId) => {
    if (!incidentId) {
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
      logger.error('No report data provided');
      setNotificationModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'No data provided. Please fill in the form.',
        type: 'error'
      });
      return;
    }
    
    try {
      logger.debug('Creating new incident', newReportData);
      
      // Upload images first if there are any
      let uploadedImageUrls = [];
      if (newReportData.imageFiles && newReportData.imageFiles.length > 0) {
        logger.debug('Uploading images...', { count: newReportData.imageFiles.length });
        try {
          const uploadResponse = await apiService.incidents.uploadImages(newReportData.imageFiles);
          uploadedImageUrls = uploadResponse.data.images || [];
          logger.debug('Images uploaded successfully', uploadedImageUrls);
        } catch (uploadError) {
          logger.error('Image upload failed', uploadError);
          setNotificationModal({
            isOpen: true,
            title: 'Image Upload Error',
            message: `Failed to upload images: ${uploadError.response?.data?.message || uploadError.message}\n\nPlease try again.`,
            type: 'error'
          });
          return;
        }
      }
      
      // The data is already in the correct format from NewReportModal
      // Just ensure we have all required backend fields
      const incidentData = {
        // Required backend fields
        incident_type: newReportData.incident_type || newReportData.reportType || 'stray',
        description: newReportData.description || 'Report submitted from admin portal',
        location: newReportData.location || 'Location to be determined',
        status: 'Pending',
        reporter_name: newReportData.reporter_name || 'Admin Portal',
        reporter_contact: newReportData.reporter_contact || newReportData.contactNumber || 'N/A',
        incident_date: newReportData.incident_date,
        // Pet information fields
        pet_color: newReportData.pet_color,
        pet_breed: newReportData.pet_breed,
        animal_type: newReportData.animal_type,
        pet_gender: newReportData.pet_gender,
        pet_size: newReportData.pet_size,
        images: uploadedImageUrls, // Use uploaded image URLs
        latitude: newReportData.latitude || null,
        longitude: newReportData.longitude || null,
      };

      logger.debug('Sending to backend', incidentData);

      // Send to backend
      const response = await apiService.incidents.create(incidentData);
      
      if (!isMountedRef.current) return;
      
      logger.debug('SUCCESS! Backend response', response);

      // Show success message
      setNotificationModal({
        isOpen: true,
        title: 'Success!',
        message: `Report submitted successfully!\n\nReport ID: ${response.data?.id || 'Generated'}\n\nThe report has been added to the system with all pet information.`,
        type: 'success'
      });
      
      // Refresh the reports list to show new incident
      logger.debug('Refreshing reports list');
      await fetchReports();
      
    } catch (err) {
      logger.error('Error creating incident:', err.response?.data || err.message);
      
      if (isMountedRef.current) {
        const errorMsg = err.response?.data?.message || err.response?.data?.details || err.message || "Failed to submit report. Please try again.";
        setNotificationModal({
          isOpen: true,
          title: 'Error',
          message: `Failed to submit report:\n\n${errorMsg}`,
          type: 'error'
        });
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

  // Export reports to CSV
  const handleExportCSV = useCallback(() => {
    if (reports.length === 0) {
      setNotificationModal({
        isOpen: true,
        title: 'No Data',
        message: 'No reports available to export',
        type: 'warning'
      });
      return;
    }

    // Prepare CSV headers
    const headers = [
      'ID', 'Reporter', 'Contact', 'Type', 'Report Type', 'Location',
      'Date', 'Time', 'Status', 'Animal Type', 'Breed', 'Color',
      'Gender', 'Size', 'Description'
    ];

    // Prepare CSV rows
    const rows = reports.map(report => [
      report.id,
      report.reporter,
      report.reporterContact,
      report.type,
      report.reportType,
      report.address,
      report.date,
      report.time,
      report.status,
      report.animalType,
      report.petBreed,
      report.petColor,
      report.petGender,
      report.petSize,
      `"${report.description.replace(/"/g, '""')}"` // Escape quotes in description
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `incident_reports_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotificationModal({
      isOpen: true,
      title: 'Export Successful',
      message: `Exported ${reports.length} reports to CSV file`,
      type: 'success'
    });
  }, [reports]);

  // View report details - fetch complete data from API
  const handleViewReport = useCallback(async (report) => {
    try {
      logger.debug('Fetching full report details', { id: report.id });
      
      // Fetch full report details with patrol info, timeline, etc.
      const response = await apiService.incidents.getById(report.id);
      
      if (response.data && response.data.data) {
        const fullReport = response.data.data;
        
        // Transform to frontend format with all details
        const transformedReport = {
          ...report,
          // Add backend fields that might not be in list view
          owner_id: fullReport.owner_id,
          account_type: fullReport.account_type,
          reporter_email: fullReport.reporter_email,
          priority: fullReport.priority,
          // Patrol details
          patrol_schedule_id: fullReport.patrol_schedule_id,
          patrol_date: fullReport.patrol_date,
          patrol_time: fullReport.patrol_time,
          patrol_status: fullReport.patrol_status,
          patrol_notes: fullReport.patrol_notes,
          assigned_catchers: fullReport.assigned_catchers || [],
          // Timeline
          timeline: fullReport.timeline || [],
          // Ensure images are included
          images: fullReport.images || report.images || []
        };
        
        setSelectedReport(transformedReport);
        fetchReportSchedules(report.id);
      } else {
        // Fallback to original report if API fails
        setSelectedReport(report);
        fetchReportSchedules(report.id);
      }
    } catch (error) {
      logger.error('Failed to fetch full report details', error);
      // Fallback to original report
      setSelectedReport(report);
      fetchReportSchedules(report.id);
    }
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`bg-white p-4 rounded-lg shadow-sm border-2 transition-all text-left ${
                      statusFilter === status 
                        ? 'border-[#FA8630] bg-[#FA8630]/5' 
                        : 'border-gray-200 hover:border-[#FA8630]/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                        <p className="text-2xl font-bold text-gray-800">{count}</p>
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
                    <label htmlFor="search-input" className="sr-only">Search reports</label>
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search by ID, type, description, status, reporter name, or location..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      aria-label="Search reports by ID, type, description, status, reporter name, or location"
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
                    onClick={handleExportCSV}
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
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{report.type}</p>
                                <p className="text-xs text-gray-500">
                                  {report.animalType && report.petBreed 
                                    ? `${report.animalType} • ${report.petBreed}`
                                    : report.animalType || 'Unknown animal'
                                  }
                                  {report.petColor && ` • ${report.petColor}`}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4"><p className="text-sm text-gray-900 max-w-xs truncate" title={report.address}>{report.address}</p></td>
                            <td className="px-6 py-4"><div><p className="text-sm text-gray-900">{report.date}</p><p className="text-xs text-gray-500">{report.time}</p></div></td>
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
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
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

              {/* Enhanced Report Details Modal - Matching MonitoringIncidents */}
              {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto">
                  <div className="bg-white w-full max-w-4xl my-8 rounded-xl shadow-2xl relative animate-fadeIn">
                    {/* Close Button - Fixed at top */}
                    <button
                      className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
                      onClick={handleCloseReportDetails}
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-700" />
                    </button>

                    {/* Scrollable Content */}
                    <div className="max-h-[85vh] overflow-y-auto">
                      <div className="p-8 space-y-6">
                        {/* Header Section */}
                        <div className="border-b border-gray-200 pb-4">
                          <div className="flex items-start justify-between pr-12">
                            <div>
                              <h2 className="text-3xl font-bold text-gray-900 mb-2">Incident Report</h2>
                              <p className="text-gray-500">Incident ID: #{selectedReport.id}</p>
                            </div>
                            <div>
                              {getStatusBadge(selectedReport.status)}
                            </div>
                          </div>
                        </div>

                        {/* Images Section */}
                        {selectedReport.images && selectedReport.images.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <svg className="h-5 w-5 text-[#FA8630]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Report Images ({selectedReport.images.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {selectedReport.images.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={getImageUrl(image)}
                                    alt={`Incident ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-[#FA8630] transition-all cursor-pointer shadow-sm"
                                    onClick={() => window.open(getImageUrl(image), '_blank')}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">Click to enlarge</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Reporter Information */}
                          <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <UserIcon className="h-5 w-5 text-blue-600" />
                              Reporter Information
                            </h3>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                  Reporter Name
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                  <span className="text-gray-900 font-medium">{selectedReport.reporter}</span>
                                </div>
                              </div>
                              
                              {selectedReport.account_type && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                    Account Type
                                  </label>
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      selectedReport.account_type === 'Pet Owner' 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                                    }`}>
                                      {selectedReport.account_type}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                  Contact Number
                                </label>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <span className="text-gray-900 font-medium">{selectedReport.reporterContact}</span>
                                </div>
                              </div>
                              
                              {selectedReport.reporter_email && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                    Email
                                  </label>
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <span className="text-gray-900 font-medium">{selectedReport.reporter_email}</span>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                    Date
                                  </label>
                                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 font-medium text-sm">{selectedReport.date}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                    Time
                                  </label>
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <span className="text-gray-900 font-medium text-sm">{selectedReport.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Incident Information */}
                          <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <ExclamationTriangleIcon className="h-5 w-5 text-[#FA8630]" />
                              Incident Information
                            </h3>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                  Report Type
                                </label>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <span className="text-gray-900 font-medium">{selectedReport.reportType || 'Animal Report'}</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                  Current Status
                                </label>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  {getStatusBadge(selectedReport.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Animal Details Section */}
                        <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Animal Details
                          </h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Animal Type
                              </label>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{selectedReport.animalType || 'Unknown'}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Breed
                              </label>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{selectedReport.petBreed}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Color
                              </label>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{selectedReport.petColor}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Gender
                              </label>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{selectedReport.petGender}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Size
                              </label>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{selectedReport.petSize}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Count
                              </label>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{selectedReport.animalCount || 1} animal(s)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-red-600" />
                            Location Details
                          </h3>
                          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <MapPinIcon className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-gray-900 font-medium">{selectedReport.address}</p>
                              {selectedReport.latitude && selectedReport.longitude && (
                                <p className="text-sm text-gray-500 mt-1">Coordinates: {selectedReport.latitude}, {selectedReport.longitude}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Incident Description
                          </h3>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-800 leading-relaxed">{selectedReport.description}</p>
                          </div>
                        </div>

                        {/* Injuries/Concerns section removed as per requirements */}

                        {/* Patrol Assignment Section */}
                        {(selectedReport.patrol_schedule_id || selectedReport.assigned_catchers?.length > 0) && (
                          <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <ClockIcon className="h-5 w-5 text-purple-600" />
                              Patrol Assignment Details
                            </h3>
                            
                            <div className="space-y-4">
                              {selectedReport.assigned_catchers && selectedReport.assigned_catchers.length > 0 && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                                    Assigned Dog Catchers
                                  </label>
                                  <div className="space-y-2">
                                    {selectedReport.assigned_catchers.map((catcher, index) => (
                                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                        <UserIcon className="h-5 w-5 text-purple-600" />
                                        <div>
                                          <p className="text-gray-900 font-medium">{catcher.full_name}</p>
                                          {catcher.contact_number && (
                                            <p className="text-sm text-gray-500">{catcher.contact_number}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4">
                                {selectedReport.patrol_date && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                      Patrol Date
                                    </label>
                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-900 font-medium">{selectedReport.patrol_date}</span>
                                    </div>
                                  </div>
                                )}
                                
                                {selectedReport.patrol_time && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                      Patrol Time
                                    </label>
                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                      <span className="text-gray-900 font-medium">{selectedReport.patrol_time}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {selectedReport.patrol_status && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                    Patrol Status
                                  </label>
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      selectedReport.patrol_status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                      selectedReport.patrol_status === 'On Patrol' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                      'bg-blue-100 text-blue-800 border border-blue-200'
                                    }`}>
                                      {selectedReport.patrol_status}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {selectedReport.patrol_notes && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                    Patrol Notes
                                  </label>
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-gray-900">{selectedReport.patrol_notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Timeline Section */}
                        {selectedReport.timeline && selectedReport.timeline.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <ClockIcon className="h-5 w-5 text-indigo-600" />
                              Incident Timeline
                            </h3>
                            <div className="relative pl-8">
                              {selectedReport.timeline.map((event, index) => (
                                <div key={index} className="relative pb-6 last:pb-0">
                                  {/* Timeline line */}
                                  {index < selectedReport.timeline.length - 1 && (
                                    <div className="absolute left-0 top-6 w-0.5 h-full bg-gray-200"></div>
                                  )}
                                  
                                  {/* Timeline dot */}
                                  <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                                    event.completed 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'bg-white border-gray-300'
                                  }`}></div>
                                  
                                  {/* Timeline content */}
                                  <div className="ml-6">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">{event.status}</p>
                                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                        </div>
                                        {event.completed && (
                                          <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                                        )}
                                      </div>
                                      {event.timestamp && (
                                        <p className="text-xs text-gray-500 mt-2">
                                          {new Date(event.timestamp).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Patrol Schedule Table */}
                        {reportSchedules.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <ClockIcon className="h-5 w-5 text-blue-600" />
                              Patrol Schedule History
                            </h3>
                            <div className="overflow-hidden rounded-lg border border-gray-300">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Assigned Staff</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Schedule Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {reportSchedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                      <td className="px-4 py-3 text-gray-800">
                                        {schedule.assigned_staff_names || "No staff assigned"}
                                      </td>
                                      <td className="px-4 py-3 text-gray-800">
                                        {schedule.schedule_date ? new Date(schedule.schedule_date).toLocaleString() : "N/A"}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          schedule.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                          schedule.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                          'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}>
                                          {schedule.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-gray-800">
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
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setIsStatusModalOpen(true)}
                            className="flex-1 bg-[#FA8630] text-white px-6 py-3 rounded-lg hover:bg-[#E87928] transition-colors font-medium shadow-sm"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={handleCloseReportDetails}
                            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm"
                          >
                            Close
                          </button>
                        </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
      />
    </div>
  );
};

export default IncidentReportingManagement;

// Display name for debugging
IncidentReportingManagement.displayName = 'IncidentReportingManagement';