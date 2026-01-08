import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPinIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Custom icon for clinic markers
 */
const createClinicIcon = (status) => {
  const colorMap = {
    Active: "#10B981",
    Pending: "#F59E0B",
    Inactive: "#6B7280",
    Suspended: "#EF4444",
  };

  const color = colorMap[status] || "#10B981";

  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          text-align: center;
          font-size: 14px;
          line-height: 20px;
        ">🏥</div>
      </div>
    `,
    className: "clinic-marker-mini",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

/**
 * MiniClinicMap - Small map overview for dashboard
 */
const MiniClinicMap = ({ clinics = [], onViewFullMap }) => {
  const [mapReady, setMapReady] = useState(false);

  // Filter clinics with valid coordinates and exclude suspended clinics
  const validClinics = clinics.filter(
    (clinic) =>
      clinic.latitude &&
      clinic.longitude &&
      !isNaN(parseFloat(clinic.latitude)) &&
      !isNaN(parseFloat(clinic.longitude)) &&
      clinic.status !== "Suspended"
  );

  // Count by status
  const statusCounts = {
    active: validClinics.filter((c) => c.status === "Active").length,
    pending: validClinics.filter((c) => c.status === "Pending").length,
    total: validClinics.length,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-[#FA8630]" />
            Smart Clinic Map
          </h2>
          {onViewFullMap && (
            <button
              onClick={onViewFullMap}
              className="text-sm text-[#FA8630] hover:text-[#E87928] font-medium flex items-center gap-1"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
              Full Map
            </button>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Active: {statusCounts.active}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-600">
              Pending: {statusCounts.pending}
            </span>
          </div>
          <div className="text-gray-500">Total: {statusCounts.total}</div>
        </div>
      </div>

      <div className="h-[300px] relative">
        {validClinics.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-sm text-gray-500">
              No clinic locations to display
            </p>
          </div>
        ) : (
          <MapContainer
            center={[13.6218, 123.1948]}
            zoom={11}
            className="h-full w-full"
            scrollWheelZoom={false}
            zoomControl={false}
            dragging={false}
            doubleClickZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {validClinics.map((clinic) => (
              <Marker
                key={clinic.id}
                position={[
                  parseFloat(clinic.latitude),
                  parseFloat(clinic.longitude),
                ]}
                icon={createClinicIcon(clinic.status)}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold">{clinic.name}</div>
                    <div className="text-gray-600">{clinic.barangay}</div>
                    <div
                      className={`mt-1 px-2 py-0.5 rounded text-white text-center ${
                        clinic.status === "Active"
                          ? "bg-green-600"
                          : clinic.status === "Pending"
                          ? "bg-amber-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {clinic.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {onViewFullMap && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
          <button
            onClick={onViewFullMap}
            className="text-sm text-[#FA8630] hover:text-[#E87928] font-medium"
          >
            View Interactive Map →
          </button>
        </div>
      )}
    </div>
  );
};

export { MiniClinicMap };
