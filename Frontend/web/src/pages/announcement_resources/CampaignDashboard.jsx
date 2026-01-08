import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/announcement_resources/drawer";
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckBadgeIcon,
  XCircleIcon,
  UserGroupIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Clinic Management Dashboard Data
  const dashboardData = {
    totalClinics: 24,
    activeClinics: 21,
    pendingApprovals: 3,
    suspendedClinics: 2,
    totalVeterinarians: 87,
    avgRating: 4.5,
    todayAppointments: 156,
    monthlyVisits: 3245,
  };

  const clinicStats = [
    {
      id: 1,
      metric: "New Registrations",
      value: 8,
      change: "+25%",
      trend: "up",
      period: "this month",
    },
    {
      id: 2,
      metric: "Avg. Response Time",
      value: "24h",
      change: "-12%",
      trend: "down",
      period: "vs last month",
    },
    {
      id: 3,
      metric: "Patient Satisfaction",
      value: "92%",
      change: "+3%",
      trend: "up",
      period: "from last quarter",
    },
    {
      id: 4,
      metric: "Capacity Usage",
      value: "78%",
      change: "+8%",
      trend: "up",
      period: "current rate",
    },
  ];

  const recentClinics = [
    {
      id: 1,
      name: "City Veterinary Hospital",
      type: "Full Service Hospital",
      location: "123 Main St, Downtown",
      openingHours: "8:00 AM - 10:00 PM",
      closingHours: "10:00 PM",
      contact: "(555) 012-3456",
      email: "contact@cityvet.com",
      status: "active",
      rating: 4.8,
      veterinarians: 12,
      services: ["Emergency", "Surgery", "Dental", "Grooming"],
      registrationDate: "2023-06-15",
      licenseNumber: "VET-2023-0456",
      lastInspection: "2023-05-20",
      totalVisits: 1245,
    },
    {
      id: 2,
      name: "Paws & Care Animal Clinic",
      type: "General Practice",
      location: "456 Oak Ave, North District",
      openingHours: "9:00 AM - 8:00 PM",
      closingHours: "8:00 PM",
      contact: "(555) 012-3457",
      email: "info@pawsandcare.com",
      status: "pending",
      rating: 4.5,
      veterinarians: 6,
      services: ["Consultation", "Vaccination", "Wellness"],
      registrationDate: "2023-06-14",
      licenseNumber: "VET-2023-0457",
      lastInspection: "Pending",
      totalVisits: 0,
    },
    {
      id: 3,
      name: "Pet Wellness Center",
      type: "Specialty Clinic",
      location: "789 Pine Rd, East Side",
      openingHours: "24/7 Emergency",
      closingHours: "24/7",
      contact: "(555) 012-3458",
      email: "emergency@petwellness.com",
      status: "active",
      rating: 4.9,
      veterinarians: 8,
      services: ["Emergency", "ICU", "Specialty Care"],
      registrationDate: "2023-06-12",
      licenseNumber: "VET-2023-0458",
      lastInspection: "2023-06-01",
      totalVisits: 896,
    },
    {
      id: 4,
      name: "Animal Rescue Clinic",
      type: "Non-Profit",
      location: "321 Elm St, West End",
      openingHours: "10:00 AM - 6:00 PM",
      closingHours: "6:00 PM",
      contact: "(555) 012-3459",
      email: "rescue@animalclinic.org",
      status: "suspended",
      rating: 4.3,
      veterinarians: 4,
      services: ["Low-cost", "Spay/Neuter", "Rescue Support"],
      registrationDate: "2023-06-10",
      licenseNumber: "VET-2023-0459",
      lastInspection: "2023-04-15",
      totalVisits: 567,
    },
    {
      id: 5,
      name: "Sunshine Pet Clinic",
      type: "General Practice",
      location: "654 Sunshine Blvd, South Park",
      openingHours: "8:30 AM - 7:30 PM",
      closingHours: "7:30 PM",
      contact: "(555) 012-3460",
      email: "care@sunshinepet.com",
      status: "active",
      rating: 4.6,
      veterinarians: 5,
      services: ["General Care", "Dental", "Grooming"],
      registrationDate: "2023-06-08",
      licenseNumber: "VET-2023-0460",
      lastInspection: "2023-05-28",
      totalVisits: 432,
    },
  ];

  const upcomingInspections = [
    {
      id: 1,
      clinicName: "City Veterinary Hospital",
      date: "2023-07-15",
      time: "10:00 AM",
      inspector: "Dr. Sarah Johnson",
      status: "scheduled",
    },
    {
      id: 2,
      clinicName: "Pet Wellness Center",
      date: "2023-07-18",
      time: "2:00 PM",
      inspector: "Dr. Michael Chen",
      status: "pending",
    },
    {
      id: 3,
      clinicName: "Sunshine Pet Clinic",
      date: "2023-07-20",
      time: "9:00 AM",
      inspector: "Dr. Emily Rodriguez",
      status: "scheduled",
    },
  ];

  const filteredClinics = recentClinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.contact.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || clinic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckBadgeIcon className="h-4 w-4 text-green-600" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case "suspended":
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
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
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Clinic Management Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage veterinary clinics, registrations, and inspections
              </p>
            </div>
            <button className="bg-[#FA8630] hover:bg-[#E87928] text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <PlusIcon className="h-5 w-5 mr-2" />
              Register New Clinic
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<BuildingLibraryIcon className="h-6 w-6 text-white" />}
              title="Total Clinics"
              value={dashboardData.totalClinics}
              subtitle="24 Active • 3 Pending"
              color="bg-gradient-to-r from-[#FA8630] to-[#FF9A3D]"
            />
            <MetricCard
              icon={<UserGroupIcon className="h-6 w-6 text-white" />}
              title="Veterinarians"
              value={dashboardData.totalVeterinarians}
              subtitle="Across all clinics"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <MetricCard
              icon={<StarIcon className="h-6 w-6 text-white" />}
              title="Avg. Rating"
              value={dashboardData.avgRating}
              subtitle="Based on patient reviews"
              color="bg-gradient-to-r from-green-500 to-green-600"
            />
            <MetricCard
              icon={<CalendarIcon className="h-6 w-6 text-white" />}
              title="Today's Appointments"
              value={dashboardData.todayAppointments}
              subtitle="Across all locations"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clinics by name, location, or contact..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630]/20 focus:border-[#FA8630] outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630]/20 focus:border-[#FA8630] outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <button className="text-[#FA8630] hover:text-[#E87928] flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-1" />
                  Export List
                </button>
              </div>
            </div>
          </div>

          {/* Clinic List and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Clinic Statistics */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Clinic Performance Statistics
                </h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {clinicStats.map((stat) => (
                  <div key={stat.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{stat.metric}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold text-gray-800">
                        {stat.value}
                      </p>
                      <div
                        className={`text-sm flex items-center ${
                          stat.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{stat.period}</p>
                  </div>
                ))}
              </div>
              <div className="h-48 bg-[#FA8630]/5 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-[#FA8630] mx-auto mb-2" />
                  <p className="text-gray-600">Clinic performance chart</p>
                  <p className="text-sm text-gray-400">
                    Visits, ratings, and capacity metrics
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Inspections */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Upcoming Inspections
                </h2>
                <button className="text-sm text-[#FA8630] hover:text-[#E87928]">
                  View Calendar →
                </button>
              </div>
              <div className="space-y-4">
                {upcomingInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-[#FA8630] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">
                        {inspection.clinicName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inspection.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inspection.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(inspection.date).toLocaleDateString()} at{" "}
                        {inspection.time}
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Inspector: {inspection.inspector}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button className="text-xs text-[#FA8630] hover:text-[#E87928]">
                        Reschedule
                      </button>
                      <button className="text-xs text-blue-600 hover:text-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Registered Clinics Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Registered Clinics ({filteredClinics.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Showing {filteredClinics.length} of {recentClinics.length}{" "}
                    clinics
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clinic Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours & Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClinics.map((clinic) => (
                    <tr
                      key={clinic.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-[#FA8630]/10 mr-3">
                              <BuildingLibraryIcon className="h-5 w-5 text-[#FA8630]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {clinic.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {clinic.type}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {clinic.location}
                            </div>
                            <div className="text-xs text-gray-500">
                              License: {clinic.licenseNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">Hours:</span>
                            <span className="ml-2">{clinic.openingHours}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {clinic.contact}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {clinic.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last Inspection: {clinic.lastInspection}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center border ${getStatusColor(
                                clinic.status
                              )}`}
                            >
                              {getStatusIcon(clinic.status)}
                              <span className="ml-1.5">
                                {clinic.status.charAt(0).toUpperCase() +
                                  clinic.status.slice(1)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{clinic.rating}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({clinic.veterinarians} vets)
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <EyeIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {clinic.totalVisits.toLocaleString()} total visits
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Clinic"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Suspend Clinic"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClinics.length === 0 && (
              <div className="text-center py-12">
                <BuildingLibraryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No clinics found matching your search criteria.
                </p>
                <button
                  className="mt-4 text-[#FA8630] hover:text-[#E87928]"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Registration dates range from{" "}
                  {new Date("2023-06-10").toLocaleDateString()} to{" "}
                  {new Date("2023-06-15").toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-[#FA8630] text-white rounded-lg text-sm hover:bg-[#E87928]">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton
                icon={<PlusIcon className="h-5 w-5" />}
                title="Register Clinic"
                description="Add new veterinary clinic"
                onClick={() => console.log("Register clinic")}
              />
              <ActionButton
                icon={<CalendarIcon className="h-5 w-5" />}
                title="Schedule Inspection"
                description="Plan clinic audit"
                onClick={() => console.log("Schedule inspection")}
              />
              <ActionButton
                icon={<DocumentTextIcon className="h-5 w-5" />}
                title="Generate Report"
                description="Monthly performance"
                onClick={() => console.log("Generate report")}
              />
              <ActionButton
                icon={<UserGroupIcon className="h-5 w-5" />}
                title="Manage Staff"
                description="Veterinarian profiles"
                onClick={() => console.log("Manage staff")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color }) => {
  return (
    <div className={`${color} p-6 rounded-lg text-white shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
        <div className="text-sm opacity-90">↗</div>
      </div>
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <p className="text-xs opacity-80">{subtitle}</p>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center p-4 hover:bg-[#FA8630]/5 rounded-lg transition-colors border border-gray-200 hover:border-[#FA8630] text-center"
    >
      <div className="p-3 rounded-full bg-[#FA8630]/10 mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
};

export default Dashboard;
