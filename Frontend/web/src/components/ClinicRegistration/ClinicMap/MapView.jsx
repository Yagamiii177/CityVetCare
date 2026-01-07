import { MapContainer, TileLayer } from "react-leaflet";
import {
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ClinicMarker from "./ClinicMarker";
import MapController from "./MapController";
import "leaflet/dist/leaflet.css";

/**
 * Main map view component displaying clinic markers
 */
const MapView = ({
  clinics,
  selectedClinic,
  onSelectClinic,
  loading,
  error,
  center = [14.5995, 120.9842], // Manila coordinates as default
  zoom = 12,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-[600px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center text-red-600">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">{error}</p>
              <p className="text-sm text-gray-500 mt-1">
                Please try refreshing the page
              </p>
            </div>
          </div>
        ) : clinics.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center text-gray-500">
              <BuildingOffice2Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No clinics found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController
              selectedClinic={selectedClinic}
              filteredClinics={clinics}
            />
            {clinics.map((clinic) => (
              <ClinicMarker
                key={clinic.id}
                clinic={clinic}
                onSelect={onSelectClinic}
              />
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapView;
