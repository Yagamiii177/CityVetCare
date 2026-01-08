import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to invalidate map size when modal opens
function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    // Invalidate size after a short delay to ensure container is rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Component to handle map clicks and draggable marker
function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

const LocationPicker = ({ latitude, longitude, onLocationSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPosition, setTempPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Default: Manila

  useEffect(() => {
    if (latitude && longitude) {
      setTempPosition({
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      });
      setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  const handleOpenModal = () => {
    // If there's already a location, use it; otherwise, use Manila center
    if (latitude && longitude) {
      setTempPosition({
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      });
      setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
    } else {
      setTempPosition(null);
      setMapCenter([14.5995, 120.9842]);
    }
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (tempPosition) {
      onLocationSelect(tempPosition.lat, tempPosition.lng);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Reset to original position
    if (latitude && longitude) {
      setTempPosition({
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      });
    } else {
      setTempPosition(null);
    }
  };

  const displayText =
    latitude && longitude
      ? `${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(
          6
        )}`
      : "Click 'Pin Location' to select on map";

  return (
    <>
      {/* Location Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayText}
            readOnly
            placeholder="Click 'Pin Location' to select on map"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-default focus:outline-none"
          />
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-6 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#e67929] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Pin Location
          </button>
        </div>
        {latitude && longitude && (
          <p className="text-xs text-gray-500 mt-1">
            Latitude: {parseFloat(latitude).toFixed(6)}, Longitude:{" "}
            {parseFloat(longitude).toFixed(6)}
          </p>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                📍 Pin Clinic Location
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Click on the map or drag the marker to select the exact location
                of the clinic
              </p>
            </div>

            {/* Map Container */}
            <div
              className="flex-1 relative overflow-hidden"
              style={{ minHeight: "500px", height: "500px" }}
            >
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                key={`${mapCenter[0]}-${mapCenter[1]}-${isOpen}`}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
                <MapInvalidator />
                <LocationMarker
                  position={tempPosition}
                  setPosition={setTempPosition}
                />
              </MapContainer>
            </div>

            {/* Selected Coordinates Display */}
            {tempPosition && (
              <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Selected Location:</strong>{" "}
                  {tempPosition.lat.toFixed(6)}, {tempPosition.lng.toFixed(6)}
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!tempPosition}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tempPosition
                    ? "bg-[#FA8630] text-white hover:bg-[#e67929]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationPicker;

