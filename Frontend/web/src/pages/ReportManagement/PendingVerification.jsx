import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
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

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Enhanced sample data
  const sampleReports = [
    {
      id: 1,
      reporter: "John Doe",
      reporterContact: "09123456789",
      reporterAddress: "Purok 4, Barangay San Juan",
      type: "Bite Incident",
      address: "Purok 4, Barangay San Juan",
      date: "2025-11-15",
      time: "14:30",
      status: "Pending",
      priority: "High",
      description: "Resident reported a bite incident involving a stray dog near the market.",
      animalType: "Stray Dog",
      animalCount: 1,
      injuries: "Minor bite on left leg",
      submittedBy: "Walk-in",
      submissionDate: "2025-11-15 14:25",
      verificationNotes: "",
    },
    {
      id: 2,
      reporter: "Maria Santos",
      reporterContact: "09198765432",
      reporterAddress: "Purok 2, Barangay San Jose",
      type: "Stray Animal",
      address: "Purok 2, Barangay San Jose",
      date: "2025-11-16",
      time: "09:15",
      status: "Pending",
      priority: "Medium",
      description: "Multiple stray cats reported roaming near the school premises.",
      animalType: "Cat",
      animalCount: 5,
      injuries: "None",
      submittedBy: "Online Portal",
      submissionDate: "2025-11-16 09:10",
      verificationNotes: "",
    },
    {
      id: 3,
      reporter: "Carlos Mendoza",
      reporterContact: "09151234567",
      reporterAddress: "Barangay Del Rosario",
      type: "Rabies Suspected",
      address: "Barangay Del Rosario",
      date: "2025-11-18",
      time: "16:45",
      status: "Pending",
      priority: "Critical",
      description: "Resident suspected rabies after attack by unknown stray dog.",
      animalType: "Dog",
      animalCount: 1,
      injuries: "Multiple bites on arms",
      submittedBy: "Walk-in",
      submissionDate: "2025-11-18 16:40",
      verificationNotes: "",
    },
    {
      id: 4,
      reporter: "Anna Lopez",
      reporterContact: "09159876543",
      reporterAddress: "Purok 3, Barangay San Isidro",
      type: "Animal Nuisance",
      address: "Purok 3, Barangay San Isidro",
      date: "2025-11-17",
      time: "11:20",
      status: "Pending",
      priority: "Low",
      description: "Stray dogs creating noise and garbage disturbance.",
      animalType: "Dog",
      animalCount: 3,
      injuries: "None",
      submittedBy: "Mobile App",
      submissionDate: "2025-11-17 11:15",
      verificationNotes: "",
    },
  ];

  // Simulate API call
  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReports(sampleReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReports();
  }, []);

  // Filter pending reports
  const pendingReports = reports.filter((r) => r.status === "Pending");

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

  // Handle Verify
  const handleVerify = async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReports(reports.map(report => 
        report.id === id 
          ? { ...report, status: "Verified", verificationNotes: "Report verified by staff" }
          : report
      ));
      
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      
      alert(`Report #${id} has been verified successfully!`);
    } catch (error) {
      alert(`Error verifying report: ${error.message}`);
    }
  };

  // Handle Reject
  const handleReject = async (id) => {
    const reason = prompt("Please enter rejection reason:");
    if (reason) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setReports(reports.map(report => 
          report.id === id 
            ? { ...report, status: "Rejected", verificationNotes: `Rejected: ${reason}` }
            : report
        ));
        
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
        
        alert(`Report #${id} has been rejected.`);
      } catch (error) {
        alert(`Error rejecting report: ${error.message}`);
      }
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
                                  {report.animalType} • {report.animalCount} animal(s)
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
                                  onClick={() => setSelectedReport(report)}
                                  className="text-[#FA8630] hover:text-[#E87928] p-1 rounded hover:bg-[#FA8630]/10 transition-colors"
                                  title="View Details"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleVerify(report.id)}
                                  className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100 transition-colors"
                                  title="Verify Report"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(report.id)}
                                  className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-100 transition-colors"
                                  title="Reject Report"
                                >
                                  <XCircleIcon className="h-5 w-5" />
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

          {/* Detailed Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
                <button
                  className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedReport(null)}
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                </button>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-[#FA8630]/10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-[#FA8630]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Report #{selectedReport.id} - Verification Required
                      </h2>
                      <p className="text-gray-600">{selectedReport.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reporter Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 border-b pb-2">Reporter Information</h3>
                      
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.reporter}</p>
                          <p className="text-xs text-gray-500">Reporter</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.reporterContact}</p>
                          <p className="text-xs text-gray-500">Contact Number</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.reporterAddress}</p>
                          <p className="text-xs text-gray-500">Reporter Address</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Submitted Via</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.submittedBy}</p>
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 border-b pb-2">Incident Details</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Priority</p>
                          <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Animal Type</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{selectedReport.animalType}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Animal Count</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{selectedReport.animalCount} animal(s)</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Injuries Reported</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedReport.injuries || "None reported"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedReport.date} at {selectedReport.time}
                          </p>
                          <p className="text-xs text-gray-500">Incident Date & Time</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location and Description */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Incident Location</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedReport.address}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Description</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleVerify(selectedReport.id)}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Verify Report
                    </button>
                    <button
                      onClick={() => handleReject(selectedReport.id)}
                      className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
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
    </div>
  );
};

export default PendingVerification;