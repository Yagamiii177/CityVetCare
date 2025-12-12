import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { apiService } from "../../utils/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color) => {
  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          text-align: center;
          font-weight: bold;
          font-size: 16px;
          line-height: 24px;
        ">!</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const biteIcon = createCustomIcon("#EF4444"); // Red for bite incidents
const strayIcon = createCustomIcon("#F59E0B"); // Amber for stray animals
const rabiesIcon = createCustomIcon("#DC2626"); // Dark red for rabies

const IncidentMonitoring = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "bite", "stray", "rabies"

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await apiService.incidents.getAll();
        
        if (response.data && response.data.records) {
          // Filter only verified and in_progress incidents for monitoring
          const activeReports = response.data.records.filter(incident => {
            const status = incident.status.toLowerCase();
            return status === 'verified' || status === 'in_progress';
          });
          
          // Transform to frontend format
          const transformedReports = activeReports.map(incident => ({
            id: incident.id,
            type: incident.title,
            location: incident.location,
            lat: incident.latitude || 13.9094,
            lng: incident.longitude || 121.7740,
            status: incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' '),
            priority: incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1),
            date: incident.incident_date || incident.created_at,
            description: incident.description,
            reporter: incident.reporter_name,
            contact: incident.reporter_contact
          }));
          
          setReports(transformedReports);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching monitoring reports:', err);
        setError(err.message || "Failed to fetch reports");
        setReports([]);
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getIconByType = (type) => {
    switch (type) {
      case "Bite Incident":
        return biteIcon;
      case "Stray Animal":
        return strayIcon;
      case "Rabies Suspected":
        return rabiesIcon;
      default:
        return biteIcon;
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      Critical: "bg-red-100 text-red-800",
      High: "bg-orange-100 text-orange-800",
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
      Verified: "bg-purple-100 text-purple-800",
      Resolved: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const filteredReports = reports.filter(report => 
    filter === "all" || 
    report.type.toLowerCase().includes(filter.toLowerCase())
  );

  // Component to handle map view changes
  const MapController = () => {
    const map = useMap();
    
    // Fit map to show all markers when reports change
    useEffect(() => {
      if (filteredReports.length > 0) {
        const group = new L.FeatureGroup(
          filteredReports.map(report => 
            L.marker([report.latitude, report.longitude])
          )
        );
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }, [filteredReports, map]);

    return null;
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
        <div className="h-screen flex flex-col p-6">
          {/* Header with Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Incident Monitoring</h1>
              <p className="text-gray-600">Real-time map of approved, scheduled, and in-progress incidents</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all" 
                    ? "bg-[#FA8630] text-white" 
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All Incidents ({reports.length})
              </button>
              <button
                onClick={() => setFilter("bite")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "bite" 
                    ? "bg-red-500 text-white" 
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Bite Incidents
              </button>
              <button
                onClick={() => setFilter("stray")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "stray" 
                    ? "bg-amber-500 text-white" 
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Stray Animals
              </button>
              <button
                onClick={() => setFilter("rabies")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "rabies" 
                    ? "bg-red-700 text-white" 
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Rabies Suspected
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-[#FA8630]" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Now</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.filter(r => r.status !== "Resolved").length}
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bite Incidents</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.filter(r => r.type === "Bite Incident").length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.filter(r => r.priority === "High" || r.priority === "Critical").length}
                  </p>
                </div>
                <FunnelIcon className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading incident reports...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-[#FA8630] hover:text-[#E87928]"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[14.5995, 120.9842]} // Default to Manila
                zoom={13}
                className="h-full w-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapController />
                
                {filteredReports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={getIconByType(report.type)}
                    eventHandlers={{
                      click: () => setSelectedReport(report),
                    }}
                  >
                    <Popup>
                      <div className="space-y-2 min-w-[250px]">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800">{report.type}</h3>
                          {getPriorityBadge(report.priority)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>{report.reporter}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>{report.date} at {report.time}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{report.address}</span>
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          {getStatusBadge(report.status)}
                          <span className="text-xs text-gray-500">{report.animalType}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 border-t pt-2 mt-2">
                          {report.description}
                        </p>
                        
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="w-full bg-[#FA8630] text-white py-1 px-3 rounded text-sm hover:bg-[#E87928] transition-colors"
                        >
                          View Full Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>
      </main>

      {/* Simple Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
            <button
              className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setSelectedReport(null)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
            </button>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedReport.type}</h2>
                <p className="text-gray-600">Incident Report Details</p>
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
                    <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-800">{selectedReport.contact}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Report Date
                    </label>
                    <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-800">{selectedReport.date}</span>
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
                        Priority
                      </label>
                      <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                        {getPriorityBadge(selectedReport.priority)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Status
                      </label>
                      <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                        {getStatusBadge(selectedReport.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Animal Type
                    </label>
                    <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-800">{selectedReport.animalType || 'Not specified'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Animal Count
                    </label>
                    <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-800">{selectedReport.animalCount || 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Location
                </label>
                <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-800">{selectedReport.location}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-800">{selectedReport.description}</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentMonitoring;