import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import {
  EyeIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Enhanced sample data
  const reports = [
    {
      id: 1,
      reporter: "John Doe",
      reporterContact: "09123456789",
      type: "Bite Incident",
      address: "Purok 4, Barangay San Juan",
      date: "2025-11-15",
      time: "14:30",
      status: "Pending",
      priority: "High",
      description: "Resident reported a bite incident involving a stray dog near the market.",
      animalType: "Dog",
      animalCount: 1,
      injuries: "Minor bite on leg",
      assignedTeam: null,
      followUpRequired: true,
    },
    {
      id: 2,
      reporter: "Maria Santos",
      reporterContact: "09198765432",
      type: "Stray Animal",
      address: "Purok 2, Barangay San Jose",
      date: "2025-11-16",
      time: "09:15",
      status: "Verified",
      priority: "Medium",
      description: "Multiple stray cats reported roaming near the school premises.",
      animalType: "Cat",
      animalCount: 5,
      injuries: "None",
      assignedTeam: "Team Alpha",
      followUpRequired: true,
    },
    {
      id: 3,
      reporter: "Carlos Mendoza",
      reporterContact: "09151234567",
      type: "Rabies Suspected",
      address: "Barangay Del Rosario",
      date: "2025-11-18",
      time: "16:45",
      status: "Resolved",
      priority: "High",
      description: "Resident suspected rabies after attack by unknown stray dog.",
      animalType: "Dog",
      animalCount: 1,
      injuries: "Multiple bites on arms",
      assignedTeam: "Team Bravo",
      followUpRequired: false,
    },
    {
      id: 4,
      reporter: "Anna Lopez",
      reporterContact: "09159876543",
      type: "Animal Nuisance",
      address: "Purok 3, Barangay San Isidro",
      date: "2025-11-17",
      time: "11:20",
      status: "In Progress",
      priority: "Low",
      description: "Stray dogs creating noise and garbage disturbance.",
      animalType: "Dog",
      animalCount: 3,
      injuries: "None",
      assignedTeam: "Team Charlie",
      followUpRequired: true,
    },
  ];

  // Filter and sort logic
  const filteredReports = reports
    .filter((report) => {
      const matchesSearch = 
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.animalType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesType = typeFilter === "all" || report.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "priority":
          { const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break; }
        case "status":
          { const statusOrder = { "Pending": 1, "In Progress": 2, "Verified": 3, "Resolved": 4 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break; }
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  // Status counts for quick overview
  const statusCounts = {
    all: reports.length,
    Pending: reports.filter(r => r.status === "Pending").length,
    "In Progress": reports.filter(r => r.status === "In Progress").length,
    Verified: reports.filter(r => r.status === "Verified").length,
    Resolved: reports.filter(r => r.status === "Resolved").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "In Progress":
        return <ExclamationTriangleIcon className="h-4 w-4 text-blue-500" />;
      case "Verified":
        return <ClipboardDocumentListIcon className="h-4 w-4 text-orange-500" />;
      case "Resolved":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
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
      "In Progress": "bg-blue-100 text-blue-800",
      Verified: "bg-orange-100 text-orange-800",
      Resolved: "bg-green-100 text-green-800",
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
              <h1 className="text-2xl font-bold text-gray-800">Incident Reports Management</h1>
              <p className="text-gray-600">Manage and track all animal incident reports</p>
            </div>
            <button className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#E87928] transition-colors">
              <PlusIcon className="h-5 w-5" />
              New Report
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Verified">Verified</option>
                    <option value="Resolved">Resolved</option>
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
              <h2 className="text-lg font-semibold text-gray-800">
                Incident Reports ({filteredReports.length})
              </h2>
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FA8630]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Type & Animal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Priority
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
                  {filteredReports.length ? (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">#{report.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.reporter}</p>
                            <p className="text-xs text-gray-500">{report.reporterContact}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.type}</p>
                            <p className="text-xs text-gray-500">{report.animalType} • {report.animalCount} animal(s)</p>
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
                          {getStatusBadge(report.status)}
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
                              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Assign Team"
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
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                              setTypeFilter("all");
                            }}
                            className="text-[#FA8630] hover:text-[#E87928] mt-2"
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

          {/* Report Details Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
                <button
                  className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedReport(null)}
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                </button>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-[#FA8630]/10">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-[#FA8630]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Incident Report #{selectedReport.id}
                      </h2>
                      <p className="text-gray-600">{selectedReport.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
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
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 border-b pb-2">Incident Details</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Priority</p>
                          <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Animal Information</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedReport.animalType} • {selectedReport.animalCount} animal(s)
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Assigned Team</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedReport.assignedTeam || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Follow-up Required</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedReport.followUpRequired ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Description</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Injuries */}
                  {selectedReport.injuries && selectedReport.injuries !== "None" && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Injuries Reported</h3>
                      <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-100">
                        {selectedReport.injuries}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button className="flex-1 bg-[#FA8630] text-white py-2 px-4 rounded-lg hover:bg-[#E87928] transition-colors">
                      Update Status
                    </button>
                    <button className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                      Assign Team
                    </button>
                    <button className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                      Add Note
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

export default IncidentReportingManagement;