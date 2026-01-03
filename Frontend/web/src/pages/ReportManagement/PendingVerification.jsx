import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { ConfirmModal, NotificationModal, InputModal } from "../../components/ReportManagement/Modal";
import { apiService } from "../../utils/api";
import {
  EyeIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const PendingVerification = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportSchedules, setReportSchedules] = useState([]); // Store schedules for selected report
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'info' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, reportId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch pending reports from backend
  useEffect(() => {
    fetchPendingReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingReports = async () => {
    try {
      setLoading(true);
      // Fetch all incidents and filter for pending/pending_verification on frontend
      const response = await apiService.incidents.getAll();
      
      // Filter for pending verification reports (accept both 'pending' and 'pending_verification')
      const pendingReports = response.data.records.filter(incident => {
        const status = incident.status.toLowerCase();
        return status === 'pending' || status === 'pending_verification';
      });
      
      // Transform backend data to frontend format with new mobile fields
      const transformedReports = pendingReports.map(incident => ({
        id: incident.id,
        reporter: incident.reporter_name,
        reporterContact: incident.reporter_contact,
        reporterAddress: incident.location,
        type: incident.title,
        address: incident.location,
        date: incident.incident_date ? incident.incident_date.split(' ')[0] : incident.created_at.split(' ')[0],
        time: incident.incident_date ? incident.incident_date.split(' ')[1] : incident.created_at.split(' ')[1],
        status: incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' '),
        priority: incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1),
        description: incident.description,
        // NEW: Use database fields directly from mobile form
        reportType: incident.incident_type ? (incident.incident_type === 'incident' ? 'Incident/Bite Report' : incident.incident_type === 'stray' ? 'Stray Animal Report' : 'Lost Pet Report') : 'Animal Report',
        animalType: incident.animal_type ? (incident.animal_type.charAt(0).toUpperCase() + incident.animal_type.slice(1)) : extractAnimalType(incident.description),
        petBreed: incident.pet_breed || 'Not specified',
        petColor: incident.pet_color || 'Not specified',
        petGender: incident.pet_gender ? (incident.pet_gender.charAt(0).toUpperCase() + incident.pet_gender.slice(1)) : 'Unknown',
        petSize: incident.pet_size ? (incident.pet_size.charAt(0).toUpperCase() + incident.pet_size.slice(1)) : 'Unknown',
        animalCount: extractAnimalCount(incident.description),
        injuries: extractInjuries(incident.description),
        submittedBy: "System",
        submissionDate: incident.created_at,
        verificationNotes: "",
      }));

      setReports(transformedReports);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending reports:", error);
      setReports([]);
      setLoading(false);
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

  // Filter pending reports (already filtered from backend, but keep for consistency)
  const pendingReports = reports.filter((r) => {
    const status = r.status.toLowerCase().replace(' ', '_');
    return status === 'pending' || status === 'pending_verification';
  });

  // Search and type filter
  const filteredReports = pendingReports.filter((r) => {
    const matchesSearch = 
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.animalType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || r.type === filterType;

    return matchesSearch && matchesType;
  });

  // Handle Verify - Update status to 'verified' in backend
  const handleVerify = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Report',
      message: `Are you sure you want to approve report #${id}? This will move it to verified status and make it available for patrol scheduling.`,
      type: 'success',
      onConfirm: () => confirmApproval(id)
    });
  };

  const confirmApproval = async (id) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    
    try {
      const report = reports.find(r => r.id === id);
      if (!report) return;

      // First, fetch the complete incident data from backend
      const incidentResponse = await apiService.incidents.getById(id);
      const incident = incidentResponse.data.data || incidentResponse.data; // Handle both old and new response format

      // Update status in backend with all required fields
      await apiService.incidents.update(id, {
        title: incident.title,
        description: incident.description,
        location: incident.location,
        latitude: incident.latitude,
        longitude: incident.longitude,
        status: 'verified',
        priority: incident.priority,
        assigned_catcher_id: incident.assigned_catcher_id,
      });
      
      // Refresh the list
      await fetchPendingReports();
      
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      
      setNotificationModal({
        isOpen: true,
        title: 'Success!',
        message: `Report #${id} has been approved successfully! It will now appear in All Incident Reports and Incident Monitoring.`,
        type: 'success'
      });
    } catch (error) {
      console.error("Error approving report:", error);
      setNotificationModal({
        isOpen: true,
        title: 'Error',
        message: `Failed to approve report: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    }
  };

  // Handle Reject - Update status to 'rejected' in backend
  const handleReject = (id) => {
    setRejectReason('');
    setRejectModal({ isOpen: true, reportId: id });
  };

  const confirmRejection = async () => {
    const id = rejectModal.reportId;
    const reason = rejectReason.trim();
    
    if (!reason) {
      setNotificationModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please enter a rejection reason.',
        type: 'warning'
      });
      return;
    }
    
    setRejectModal({ isOpen: false, reportId: null });

    try {
      const report = reports.find(r => r.id === id);
      if (!report) return;

      // First, fetch the complete incident data from backend
      const incidentResponse = await apiService.incidents.getById(id);
      const incident = incidentResponse.data.data || incidentResponse.data; // Handle both old and new response format

      // Update status in backend with rejection note and all required fields
      await apiService.incidents.update(id, {
        title: incident.title,
        description: `${incident.description}\n\n[REJECTED: ${reason}]`,
        location: incident.location,
        latitude: incident.latitude,
        longitude: incident.longitude,
        status: 'rejected',
        priority: incident.priority,
        assigned_catcher_id: incident.assigned_catcher_id,
      });
      
      // Refresh the list
      await fetchPendingReports();
      
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      
      setNotificationModal({
        isOpen: true,
        title: 'Report Rejected',
        message: `Report #${id} has been rejected and moved to Report History.`,
        type: 'info'
      });
    } catch (error) {
      console.error("Error rejecting report:", error);
      setNotificationModal({
        isOpen: true,
        title: 'Error',
        message: `Failed to reject report: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const styles = {
      Critical: "bg-red-100 text-red-800 border border-red-200",
      High: "bg-orange-100 text-orange-800 border border-orange-200",
      Medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Low: "bg-green-100 text-green-800 border border-green-200",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  // Stats
  const stats = {
    total: pendingReports.length,
    bite: pendingReports.filter(r => r.type === "Bite Incident").length,
    stray: pendingReports.filter(r => r.type === "Stray Animal").length,
    rabies: pendingReports.filter(r => r.type === "Rabies Suspected").length,
    nuisance: pendingReports.filter(r => r.type === "Animal Nuisance").length,
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
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pending Verification</h1>
              <p className="text-gray-600">Review and verify incident reports</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold text-[#FA8630]">{stats.total}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bite Incidents</p>
                  <p className="text-xl font-bold text-gray-800">{stats.bite}</p>
                </div>
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stray Animals</p>
                  <p className="text-xl font-bold text-gray-800">{stats.stray}</p>
                </div>
                <UserIcon className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rabies Suspected</p>
                  <p className="text-xl font-bold text-gray-800">{stats.rabies}</p>
                </div>
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nuisance</p>
                  <p className="text-xl font-bold text-gray-800">{stats.nuisance}</p>
                </div>
                <ClockIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <ClockIcon className="h-6 w-6 text-[#FA8630]" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports by type, reporter, location, or animal type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-3"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="Bite Incident">Bite Incidents</option>
                  <option value="Stray Animal">Stray Animals</option>
                  <option value="Rabies Suspected">Rabies Suspected</option>
                  <option value="Animal Nuisance">Animal Nuisance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading pending reports...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pending Reports ({filteredReports.length})
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    Requires verification
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FA8630]/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Report ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Reporter & Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Incident Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filteredReports.length ? (
                        filteredReports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono font-medium text-gray-900">#{report.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{report.reporter}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <PhoneIcon className="h-3 w-3" />
                                  {report.reporterContact}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{report.type}</p>
                                <p className="text-xs text-gray-500">
                                  {report.animalType}{report.petBreed && report.petBreed !== 'Not specified' ? ` • ${report.petBreed}` : ''}{report.petColor && report.petColor !== 'Not specified' ? ` • ${report.petColor}` : ''}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900 max-w-xs truncate">{report.address}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900">{report.date}</p>
                                <p className="text-xs text-gray-500">{report.time}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getPriorityBadge(report.priority)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setSelectedReport(report); fetchReportSchedules(report.id); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#FA8630] hover:bg-[#E87928] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                  title="View Details"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => handleVerify(report.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                  title="Approve Report"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReject(report.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                  title="Reject Report"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No pending reports found</p>
                              <p className="text-sm mt-1">All reports have been processed</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Detailed Modal - Simplified */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
                <button
                  className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedReport(null)}
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                </button>

                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Report #{selectedReport.id}</h2>
                    <p className="text-gray-600">{selectedReport.type} - Pending Verification</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reporter Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Reporter Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Reporter Name
                        </label>
                        <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-800">{selectedReport.reporter}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Contact Number
                        </label>
                        <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-800">{selectedReport.reporterContact}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Reporter Address
                        </label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <span className="text-gray-800">{selectedReport.reporterAddress}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Submitted Via
                        </label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <span className="text-gray-800">{selectedReport.submittedBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Incident Information
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Animal Type
                          </label>
                          <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                            <span className="text-gray-800">{selectedReport.animalType} • {selectedReport.petBreed} • {selectedReport.petColor} • {selectedReport.petGender} • {selectedReport.petSize}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Animal Count
                          </label>
                          <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                            <span className="text-gray-800">{selectedReport.animalCount} animal(s)</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Priority Level
                        </label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                          {getPriorityBadge(selectedReport.priority)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Injuries Reported
                        </label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <span className="text-gray-800">{selectedReport.injuries || "None reported"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Incident Date & Time
                        </label>
                        <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-800">{selectedReport.date} at {selectedReport.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Incident Location
                    </label>
                    <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-800">{selectedReport.address}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Incident Description
                    </label>
                    <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>
                  </div>

                  {/* Patrol Schedule Table */}
                  {reportSchedules.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
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
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleVerify(selectedReport.id)}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Approve Report
                    </button>
                    <button
                      onClick={() => handleReject(selectedReport.id)}
                      className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Reject Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Reject Modal with Input */}
      <InputModal
        isOpen={rejectModal.isOpen}
        title="Reject Report"
        message={`Please provide a reason for rejecting report #${rejectModal.reportId}:`}
        placeholder="Enter rejection reason..."
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        onConfirm={confirmRejection}
        onCancel={() => {
          setRejectModal({ isOpen: false, reportId: null });
          setRejectReason('');
        }}
        type="error"
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

export default PendingVerification;