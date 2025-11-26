import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
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

  // Sample data - replace with your actual API call
  const sampleReports = [
    {
      id: 1,
      type: "Bite Incident",
      reporter: "John Doe",
      date: "2025-11-15",
      time: "14:30",
      address: "Purok 4, Barangay San Juan",
      description: "Dog bite incident near the market area",
      latitude: 14.5995,
      longitude: 120.9842,
      status: "Pending",
      priority: "High",
      animalType: "Stray Dog",
    },
    {
      id: 2,
      type: "Stray Animal",
      reporter: "Maria Santos",
      date: "2025-11-16",
      time: "09:15",
      address: "Purok 2, Barangay San Jose",
      description: "Multiple stray dogs roaming near school",
      latitude: 14.6010,
      longitude: 120.9900,
      status: "Verified",
      priority: "Medium",
      animalType: "Dog",
    },
    {
      id: 3,
      type: "Rabies Suspected",
      reporter: "Carlos Mendoza",
      date: "2025-11-17",
      time: "16:45",
      address: "Barangay Del Rosario",
      description: "Suspected rabies case in stray dog",
      latitude: 14.5980,
      longitude: 120.9780,
      status: "In Progress",
      priority: "Critical",
      animalType: "Dog",
    },
    {
      id: 4,
      type: "Bite Incident",
      reporter: "Anna Lopez",
      date: "2025-11-18",
      time: "11:20",
      address: "Purok 3, Barangay San Isidro",
      description: "Cat bite incident in residential area",
      latitude: 14.6030,
      longitude: 120.9950,
      status: "Resolved",
      priority: "Medium",
      animalType: "Cat",
    },
  ];

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with your actual API
        // const response = await axios.get("/api/reports");
        // setReports(response.data);
        
        // Using sample data for demonstration
        setTimeout(() => {
          setReports(sampleReports);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message || "Failed to fetch reports");
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
              <p className="text-gray-600">Real-time tracking of reported incidents</p>
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
                          onClick={() => {
                            // Handle view details
                            console.log("View details for:", report.id);
                          }}
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
    </div>
  );
};

export default IncidentMonitoring;