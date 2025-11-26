import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { apiService } from "../../utils/api";
import {
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ReportHistory = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [historyReports, setHistoryReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, resolved, rejected, cancelled

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistoryReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.incidents.getAll();
      
      if (!response || !response.data || !response.data.records) {
        throw new Error('Invalid API response structure');
      }
      
      // Filter for completed/historical reports (exclude pending status)
      const historicalReports = response.data.records.filter(incident => 
        incident.status.toLowerCase() !== 'pending'
      );

      // Transform backend data to frontend format
      const transformedReports = historicalReports.map(incident => ({
        id: incident.id,
        reporter: incident.reporter_name || 'Anonymous',
        reporterContact: incident.reporter_contact || 'N/A',
        type: incident.title,
        address: incident.location,
        date: incident.incident_date ? incident.incident_date.split(' ')[0] : incident.created_at.split(' ')[0],
        completedOn: incident.updated_at ? incident.updated_at.split(' ')[0] : 'N/A',
        status: incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' '),
        priority: incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1),
        description: incident.description,
        assignedTeam: incident.catcher_team_name || 'Not Assigned',
        images: Array.isArray(incident.images) ? incident.images : [],
      }));

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
                  <option value="verified">Verified</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl mb-4">
              Archived and completed incident reports. Click a row to view details. {!loading && <span className="text-[#FA8630]">● Live</span>}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-800">{historyReports.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Verified</p>
                <p className="text-2xl font-bold text-blue-800">
                  {historyReports.filter(r => r.status === 'Verified').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-800">
                  {historyReports.filter(r => r.status === 'In Progress').length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-800">
                  {historyReports.filter(r => r.status === 'Resolved').length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">Rejected/Cancelled</p>
                <p className="text-2xl font-bold text-red-800">
                  {historyReports.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length}
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

          {/* Modal (matches ObservationProfile style: sticky header, scrollable body) */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white p-6 pb-4 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Incident Report #{selectedReport.id}
                  </h2>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto flex-1">
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left column: basic info */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Reporter</h3>
                        <p className="text-gray-700 flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          {selectedReport.reporter}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Type</h3>
                        <p className="text-gray-700">{selectedReport.type}</p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Status</h3>
                        <p className="text-gray-700">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              selectedReport.status === "Resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedReport.status}
                          </span>
                        </p>
                      </div>

                      {/* Middle column: location & dates */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                        <p className="text-gray-700 flex items-center gap-2">
                          <MapPinIcon className="h-5 w-5 text-gray-500" />
                          {selectedReport.address}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Report Date</h3>
                        <p className="text-gray-700 flex items-center gap-2">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                          {selectedReport.date}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Completed On</h3>
                        <p className="text-gray-700">{selectedReport.completedOn}</p>
                      </div>

                      {/* Right column: description / images */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                        <div className="bg-gray-50 p-4 rounded">{selectedReport.description}</div>

                        {/* Images placeholder — if images exist show thumbnails */}
                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Images</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedReport.images && selectedReport.images.length > 0 ? (
                            selectedReport.images.map((src, i) => (
                              <div key={i} className="h-20 border rounded overflow-hidden">
                                <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 text-sm text-gray-500">No images available</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Optional: timeline, notes, officer comments */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Notes / Resolution</h3>
                      <div className="bg-gray-50 p-4 rounded text-gray-700">
                        Patrol dispatched and incident resolved. Documentation filed and victim advised.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors"
                  >
                    Close
                  </button>
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
