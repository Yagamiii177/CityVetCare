import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { apiService, getImageUrl } from "../../utils/api";
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
  ArrowPathIcon,
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
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.incidents.getAll();
      
      if (response.data && response.data.records) {
        // Show only active incidents (exclude completed, resolved, rejected, cancelled)
        const activeReports = response.data.records.filter(incident => {
          const status = incident.status.toLowerCase();
          return status !== 'rejected' && status !== 'cancelled' && status !== 'resolved' && status !== 'completed';
        });
          
          // Transform to frontend format with new mobile fields
          const transformedReports = activeReports.map(incident => {
            const incidentDate = incident.incident_date || incident.created_at;
            const [datePart, timePart] = incidentDate.split(' ');
            
            return {
              id: incident.id,
              type: incident.title,
              location: incident.location,
              address: incident.location,
              latitude: incident.latitude || 13.6218,
              longitude: incident.longitude || 123.1948,
              lat: incident.latitude || 13.6218,
              lng: incident.longitude || 123.1948,
              status: incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' '),
              date: datePart || incidentDate.split('T')[0] || new Date().toISOString().split('T')[0],
              time: timePart || incidentDate.split('T')[1]?.split('.')[0] || new Date().toTimeString().split(' ')[0],
              description: incident.description,
              reporter: incident.reporter_name || 'Anonymous',
              contact: incident.reporter_contact || 'No contact',
              images: incident.images || [],
              // NEW: Mobile form fields
              reportType: incident.incident_type,
              animalType: incident.animal_type ? (incident.animal_type.charAt(0).toUpperCase() + incident.animal_type.slice(1)) : 'Unknown',
              petBreed: incident.pet_breed || 'Not specified',
              petColor: incident.pet_color || 'Not specified',
              petGender: incident.pet_gender ? (incident.pet_gender.charAt(0).toUpperCase() + incident.pet_gender.slice(1)) : 'Unknown',
              petSize: incident.pet_size ? (incident.pet_size.charAt(0).toUpperCase() + incident.pet_size.slice(1)) : 'Unknown',
              animalCount: 1 // Default to 1, can be extracted from description if needed
            };
          });
          
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

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // Refresh function for manual updates
  const handleRefresh = () => {
    fetchReports();
  };

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
        const validReports = filteredReports.filter(report => 
          report.latitude && report.longitude
        );
        
        if (validReports.length > 0) {
          const group = new L.FeatureGroup(
            validReports.map(report => 
              L.marker([report.latitude, report.longitude])
            )
          );
          map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
      }
    }, [map]); // filteredReports removed - it's calculated from reports which triggers re-renders

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
              <p className="text-gray-600">Real-time map of all active incidents</p>
            </div>
            
            {/* Filters and Refresh */}
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Refresh incidents"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.filter(r => r.status === "In Progress").length}
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.filter(r => r.status === "Pending").length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
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
                center={[13.6218, 123.1948]} // Default to Naga City
                zoom={12}
                className="h-full w-full"
                scrollWheelZoom={true}
                zoomControl={true}
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
                          {getStatusBadge(report.status)}
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
                          <span className="text-xs text-gray-500">{report.animalType}{report.petBreed && report.petBreed !== 'Not specified' ? ` • ${report.petBreed}` : ''}{report.petColor && report.petColor !== 'Not specified' ? ` • ${report.petColor}` : ''}</span>
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

      {/* Enhanced Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
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
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedReport.type}</h2>
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
                          <span className="text-gray-900 font-medium">{selectedReport.contact}</span>
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
                      <p className="text-gray-900 font-medium">{selectedReport.location}</p>
                      <p className="text-sm text-gray-500 mt-1">Coordinates: {selectedReport.latitude}, {selectedReport.longitude}</p>
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors font-medium shadow-sm flex items-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentMonitoring;