import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { apiService, getImageUrl } from "../../utils/api";
import {
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  ArrowPathIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ReportHistory = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [historyReports, setHistoryReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, resolved, rejected, cancelled
  const [reportSchedules, setReportSchedules] = useState([]);

  const toggleDrawer = () => setIsDrawerOpen((s) => !s);

  // Fetch history reports from backend
  useEffect(() => {
    fetchHistoryReports();
    
    // Auto-refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchHistoryReports();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Auto-refresh every 30 seconds when page is active
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchHistoryReports();
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  const fetchHistoryReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.incidents.getAll();
      
      if (!response || !response.data || !response.data.records) {
        throw new Error('Invalid API response structure');
      }
      
      // Filter for completed/historical reports (resolved, rejected, cancelled only)
      const historicalReports = response.data.records.filter(incident => {
        const status = incident.status.toLowerCase();
        return status === 'resolved' || status === 'rejected' || status === 'cancelled';
      });

      // Transform backend data to frontend format with new mobile fields
      const transformedReports = historicalReports.map(incident => {
        // Parse date/time properly
        const getDateTime = (dateTimeStr) => {
          try {
            if (!dateTimeStr) return { date: 'Not specified', time: 'Not specified' };
            const dateObj = new Date(dateTimeStr);
            if (isNaN(dateObj.getTime())) {
              const parts = dateTimeStr.split(' ');
              return { date: parts[0] || 'Not specified', time: parts[1] || 'Not specified' };
            }
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');
            return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}:${seconds}` };
          } catch (error) {
            return { date: 'Not specified', time: 'Not specified' };
          }
        };
        
        const { date, time } = getDateTime(incident.incident_date || incident.created_at);
        
        return {
        id: incident.id,
        reporter: incident.reporter_name || 'Anonymous',
        reporterContact: incident.reporter_contact || 'N/A',
        type: incident.title || 'Unknown Incident',
        address: incident.location,
        date,
        time,
        completedOn: incident.updated_at ? incident.updated_at.split(' ')[0] : 'N/A',
        status: incident.status ? (incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' ')) : 'Unknown',
        priority: incident.priority ? (incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)) : 'Medium',
        description: incident.description || 'No description',
        assignedTeam: incident.assigned_team || 'Not Assigned',
        images: Array.isArray(incident.images) ? incident.images : [],
        // NEW: Mobile form fields
        reportType: incident.report_type ? (incident.report_type === 'bite' ? 'Incident/Bite Report' : incident.report_type === 'stray' ? 'Stray Animal Report' : incident.report_type === 'lost' ? 'Lost Pet Report' : 'Animal Report') : 'Animal Report',
        animalType: incident.animal_type ? (incident.animal_type.charAt(0).toUpperCase() + incident.animal_type.slice(1)) : 'Unknown',
        petBreed: incident.pet_breed || 'Not specified',
        petColor: incident.pet_color || 'Not specified',
        petGender: incident.pet_gender ? (incident.pet_gender.charAt(0).toUpperCase() + incident.pet_gender.slice(1)) : 'Unknown',
        petSize: incident.pet_size ? (incident.pet_size.charAt(0).toUpperCase() + incident.pet_size.slice(1)) : 'Unknown',
        latitude: incident.latitude,
        longitude: incident.longitude,
      };
      });

      // Sort by completed date (most recent first)
      transformedReports.sort((a, b) => new Date(b.completedOn) - new Date(a.completedOn));

      setHistoryReports(transformedReports);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching history reports:", err);
      setError(`Failed to load report history: ${err.message || 'Unknown error'}`);
      setHistoryReports([]);
      setLoading(false);
    }
  };

  // Fetch schedules for a specific incident
  const fetchReportSchedules = async (incidentId) => {
    try {
      const response = await apiService.patrolSchedules.getAll();
      const incidentSchedules = response.data.records.filter(
        (schedule) => schedule.incident_id === incidentId
      );
      setReportSchedules(incidentSchedules);
    } catch (error) {
      console.error("Error fetching report schedules:", error);
      setReportSchedules([]);
    }
  };

  // Handle view report with timeline and schedule data
  const handleViewReport = async (report) => {
    try {
      // Fetch full report details including timeline
      const response = await apiService.incidents.getById(report.id);
      
      if (response.data && response.data.data) {
        const fullReport = response.data.data;
        
        // Transform to include timeline and schedule data
        const transformedReport = {
          ...report,
          timeline: fullReport.timeline || [],
          patrol_schedule_id: fullReport.patrol_schedule_id,
          patrol_date: fullReport.patrol_date,
          patrol_time: fullReport.patrol_time,
          patrol_status: fullReport.patrol_status,
          patrol_notes: fullReport.patrol_notes,
          assigned_catchers: fullReport.assigned_catchers || [],
        };
        
        setSelectedReport(transformedReport);
        fetchReportSchedules(report.id);
      } else {
        setSelectedReport(report);
        fetchReportSchedules(report.id);
      }
    } catch (error) {
      console.error('Failed to fetch full report details:', error);
      setSelectedReport(report);
      fetchReportSchedules(report.id);
    }
  };

  // Filter reports based on status
  const filteredReports = filterStatus === "all" 
    ? historyReports 
    : historyReports.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      Resolved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
      Verified: "bg-blue-100 text-blue-800",
      "In Progress": "bg-purple-100 text-purple-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - City Veterinarian" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${isDrawerOpen ? "ml-64" : "ml-0"}`}
      >
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Top area */}
          <div className="px-6 py-8 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Report History</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchHistoryReports}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl mb-4">
              Resolved, rejected, and cancelled incident reports. Click a row to view details. {!loading && <span className="text-[#FA8630]">● Live</span>}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-800">{historyReports.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-800">
                  {historyReports.filter(r => r.status === 'Resolved').length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-800">
                  {historyReports.filter(r => r.status === 'Rejected').length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">
                  {historyReports.filter(r => r.status === 'Cancelled').length}
                </p>
              </div>
            </div>
          </div>

          {/* Table container (fixed header + scrollable body) */}
          <div className="flex-1 px-6 pb-8 overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full flex flex-col">
              {/* Table Header (sticky area visually) */}
              <div className="flex-shrink-0 bg-[#FA8630]/10">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Report Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Completed On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8]">
                  <tbody className="bg-white divide-y divide-[#E8E8E8]">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630]"></div>
                            <p className="mt-4 text-gray-600">Loading history...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                              onClick={() => fetchHistoryReports()}
                              className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors"
                            >
                              Retry
                            </button>
                            <p className="text-sm text-gray-500 mt-2">Check browser console for details</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <tr
                          key={report.id}
                          className="hover:bg-[#FA8630]/5 cursor-pointer"
                          onClick={() => setSelectedReport(report)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            #{report.id}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.reporter}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.type}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.address}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.date}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.completedOn}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(report.status)}
                          </td>

                          <td
                            className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="inline-flex items-center gap-2 text-[#FA8630] hover:text-[#E87928]"
                              title="View details"
                            >
                              <EyeIcon className="h-5 w-5" />
                              <span className="hidden sm:inline text-sm">View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <CalendarDaysIcon className="h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No history records found</p>
                            <p className="text-sm mt-1">
                              {filterStatus !== "all" 
                                ? `No ${filterStatus} reports in history` 
                                : "Completed reports will appear here"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Enhanced Detail Modal - Matching AllIncidentReport */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-4xl my-8 rounded-xl shadow-2xl relative animate-fadeIn">
                {/* Close Button - Fixed at top */}
                <button
                  className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
                  onClick={() => setSelectedReport(null)}
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

                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                              Contact Number
                            </label>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-gray-900 font-medium">{selectedReport.reporterContact}</span>
                            </div>
                          </div>

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
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                              Completed On
                            </label>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-gray-900 font-medium">{selectedReport.completedOn}</span>
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

                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                              Assigned Team
                            </label>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-gray-900 font-medium">{selectedReport.assignedTeam || 'Not assigned'}</span>
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
                                <tr key={schedule.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-gray-900">{schedule.catcher_name || 'Not assigned'}</td>
                                  <td className="px-4 py-3 text-gray-900">{schedule.schedule_date || 'N/A'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      schedule.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                      schedule.status === 'On Patrol' ? 'bg-blue-100 text-blue-800' :
                                      schedule.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {schedule.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 text-xs">{schedule.created_at || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedReport(null)}
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
        </div>
      </main>
    </div>
  );
};

export default ReportHistory;
