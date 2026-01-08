import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/clinic_registration/drawer";
import { apiService } from "../../utils/api";

// Fix for default markers in react-leaflet - COPIED FROM MonitoringIncidents
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon creation - COPIED FROM MonitoringIncidents
const createCustomIcon = (status) => {
  const colorMap = {
    Active: "#10B981", // Green
    Pending: "#F59E0B", // Amber
    Inactive: "#6B7280", // Gray
    Suspended: "#EF4444", // Red
  };

  const color = colorMap[status] || "#10B981";

  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
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
          font-size: 18px;
          line-height: 26px;
        ">🏥</div>
      </div>
    `,
    className: "clinic-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Status badge component - COPIED FROM MonitoringIncidents
const getStatusBadge = (status) => {
  const statusConfig = {
    Active: { color: "green", label: "Active" },
    Pending: { color: "amber", label: "Pending Review" },
    Inactive: { color: "gray", label: "Inactive" },
    Suspended: { color: "red", label: "Suspended" },
  };

  const config = statusConfig[status] || statusConfig.Active;

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}
    >
      {config.label}
    </span>
  );
};

/**
 * ClinicMap - Main page displaying clinics on interactive map
 * COPIED FROM MonitoringIncidents.jsx and adapted for clinics
 */
const ClinicMap = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch clinics from API
  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await apiService.clinics.getLocations({ status: "all" });

      if (response.data) {
        const transformedClinics = response.data.map((clinic) => {
          const lat = clinic.Latitude || clinic.latitude;
          const lng = clinic.Longitude || clinic.longitude;

          return {
            id: clinic.id || clinic.Id,
            name: clinic.name || clinic.Name || "Unnamed Clinic",
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            status: clinic.status || clinic.Status || "Active",
            barangay: clinic.barangay || clinic.Barangay || "",
            address: clinic.address || clinic.Address || "",
            phone: clinic.phone || clinic.Phone || "",
            veterinarian:
              clinic.veterinarian || clinic.Veterinarian || "Not assigned",
            services: Array.isArray(clinic.services)
              ? clinic.services
              : Array.isArray(clinic.Services)
              ? clinic.Services
              : [],
            workingHours: clinic.workingHours || clinic.WorkingHours || null,
          };
        });

        setClinics(transformedClinics);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError(err.message || "Failed to fetch clinics");
      setClinics([]);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClinics();
  }, []);

  // Refresh function for manual updates
  const handleRefresh = () => {
    fetchClinics();
  };

  // Calculate filtered clinics directly from state
  const filteredClinics = clinics.filter((clinic) => {
    // Exclude suspended clinics from map display
    if (clinic.status === "Suspended") {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && clinic.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const name = (clinic.name || "").toLowerCase();
      const barangay = (clinic.barangay || "").toLowerCase();
      const address = (clinic.address || "").toLowerCase();
      const vet = (clinic.veterinarian || "").toLowerCase();
      return (
        name.includes(search) ||
        barangay.includes(search) ||
        address.includes(search) ||
        vet.includes(search)
      );
    }

    return true;
  });

  // Status counts
  const statusCounts = {
    all: clinics.length,
    Active: clinics.filter((c) => c.status === "Active").length,
    Pending: clinics.filter((c) => c.status === "Pending").length,
    Inactive: clinics.filter((c) => c.status === "Inactive").length,
    Suspended: clinics.filter((c) => c.status === "Suspended").length,
  };

  // Component to handle map view changes
  const MapController = () => {
    const map = useMap();

    // Fit map to show all markers when clinics are loaded
    useEffect(() => {
      if (filteredClinics.length > 0) {
        const validClinics = filteredClinics.filter(
          (clinic) => clinic.latitude && clinic.longitude
        );

        if (validClinics.length > 0) {
          const group = new L.FeatureGroup(
            validClinics.map((clinic) =>
              L.marker([clinic.latitude, clinic.longitude])
            )
          );
          map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
      }
    }, [map, filteredClinics]);

    return null;
  };

  const handleClinicClick = (clinic) => {
    console.log("[CLINIC MAP] Clinic clicked:", clinic.name);
    setSelectedClinic(clinic);
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "City Vet Staff" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Clinic Map & Monitoring
              </h1>
              <p className="text-gray-600">
                Real-time view of veterinary clinics in the area
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-xs text-red-700 hover:text-red-900 underline mt-1"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Status Filter Buttons - COPIED FROM MonitoringIncidents */}
          <div className="grid grid-cols-5 gap-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={`p-4 rounded-lg text-center transition-all ${
                statusFilter === "all"
                  ? "bg-[#FA8630] text-white shadow-lg"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <div className="text-sm">All Clinics</div>
            </button>

            <button
              onClick={() => setStatusFilter("Active")}
              className={`p-4 rounded-lg text-center transition-all ${
                statusFilter === "Active"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.Active}
              </div>
              <div className="text-sm">Active</div>
            </button>

            <button
              onClick={() => setStatusFilter("Pending")}
              className={`p-4 rounded-lg text-center transition-all ${
                statusFilter === "Pending"
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-amber-600">
                {statusCounts.Pending}
              </div>
              <div className="text-sm">Pending</div>
            </button>

            <button
              onClick={() => setStatusFilter("Inactive")}
              className={`p-4 rounded-lg text-center transition-all ${
                statusFilter === "Inactive"
                  ? "bg-gray-500 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-gray-600">
                {statusCounts.Inactive}
              </div>
              <div className="text-sm">Inactive</div>
            </button>

            <button
              onClick={() => setStatusFilter("Suspended")}
              className={`p-4 rounded-lg text-center transition-all ${
                statusFilter === "Suspended"
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.Suspended}
              </div>
              <div className="text-sm">Suspended</div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="clinic-search" className="flex items-center gap-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                id="clinic-search"
                name="clinic-search"
                type="search"
                placeholder="Search by clinic name, barangay, address, or veterinarian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                className="flex-1 outline-none text-gray-700"
                aria-label="Search clinics by name, barangay, address, or veterinarian"
              />
            </label>
          </div>

          {/* Map and Sidebar Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Map Container - 2/3 width */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-[600px] relative">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <ArrowPathIcon className="h-8 w-8 text-[#FA8630] animate-spin" />
                    </div>
                  ) : filteredClinics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <BuildingOffice2Icon className="h-16 w-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No clinics found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  ) : (
                    <MapContainer
                      center={[14.5995, 120.9842]}
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
                      {filteredClinics.map((clinic) => (
                        <Marker
                          key={clinic.id}
                          position={[clinic.latitude, clinic.longitude]}
                          icon={createCustomIcon(clinic.status)}
                        >
                          <Popup>
                            <div className="p-2 min-w-[250px]">
                              <h3 className="font-bold text-lg mb-2">
                                {clinic.name}
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <MapPinIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">
                                    {clinic.address}
                                    {clinic.barangay && `, ${clinic.barangay}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {clinic.phone || "No phone"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {clinic.veterinarian}
                                  </span>
                                </div>
                                <div className="pt-2 border-t">
                                  {getStatusBadge(clinic.status)}
                                </div>
                                {clinic.services &&
                                  clinic.services.length > 0 && (
                                    <div className="pt-2">
                                      <p className="text-xs font-semibold text-gray-600 mb-1">
                                        Services:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {clinic.services.map((service, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded"
                                          >
                                            {service}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                {clinic.workingHours &&
                                  clinic.workingHours.days &&
                                  clinic.workingHours.openingTime &&
                                  clinic.workingHours.closingTime && (
                                    <div className="pt-2 border-t">
                                      <p className="text-xs font-semibold text-gray-600 mb-1">
                                        Working Hours:
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        {clinic.workingHours.days}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {clinic.workingHours.openingTime} -{" "}
                                        {clinic.workingHours.closingTime}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BuildingOffice2Icon className="h-6 w-6 text-[#FA8630]" />
                  Clinic List
                </h2>
                <div className="space-y-3 max-h-[540px] overflow-y-auto">
                  {filteredClinics.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No clinics to display
                    </p>
                  ) : (
                    filteredClinics.map((clinic) => (
                      <div
                        key={clinic.id}
                        onClick={() => handleClinicClick(clinic)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedClinic?.id === clinic.id
                            ? "border-[#FA8630] bg-orange-50"
                            : "border-gray-200 hover:border-[#FA8630] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {clinic.name}
                          </h3>
                          {getStatusBadge(clinic.status)}
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-start gap-1">
                            <MapPinIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              {clinic.barangay}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {clinic.veterinarian}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicMap;
