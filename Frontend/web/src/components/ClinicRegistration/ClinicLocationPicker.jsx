import { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { XMarkIcon, MapPinIcon, CheckIcon } from "@heroicons/react/24/outline";

// Fix for default markers in react-leaflet - ensure this runs only once
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Custom orange pin icon for location selection
const orangePinIcon = new L.DivIcon({
  html: `
    <div style="
      background-color: #FA8630;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        text-align: center;
        font-weight: bold;
        font-size: 18px;
        line-height: 26px;
      ">📍</div>
    </div>
  `,
  className: "custom-pin-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

// Ensure the map recalculates size when the modal becomes visible
const MapResizer = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (center) {
        map.setView([center.lat, center.lng]);
      }
    }, 150);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [map, center]);
  return null;
};

/**
 * ClinicLocationPicker Component
 * Allows users to pin clinic location on a map
 */
const ClinicLocationPicker = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialPosition = null,
}) => {
  // Default to Manila, Philippines
  const [selectedPosition, setSelectedPosition] = useState(
    initialPosition || { lat: 14.5995, lng: 120.9842 }
  );
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // Reset position and force map re-render when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialPosition) {
        setSelectedPosition(initialPosition);
      }
      // Force map to re-initialize by changing key
      setMapKey((prev) => prev + 1);
    }
  }, [isOpen, initialPosition]);

  // Reverse geocode to get address from coordinates
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const displayAddress =
          data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(displayAddress);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
    setLoadingAddress(false);
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (latlng) => {
      setSelectedPosition(latlng);
      getAddressFromCoordinates(latlng.lat, latlng.lng);
    },
    [getAddressFromCoordinates]
  );

  // Handle confirmation
  const handleConfirm = () => {
    if (selectedPosition && onLocationSelect) {
      onLocationSelect({
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        address: address,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#FA8630] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Pin Clinic Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-orange-50 border-b border-orange-100">
          <p className="text-sm text-orange-900 flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-orange-600" />
            <strong>Click anywhere on the map</strong> to pin the clinic
            location. The coordinates and address will be captured
            automatically.
          </p>
        </div>

        {/* Map Container */}
        <div
          className="relative bg-gray-100"
          style={{ height: "500px", width: "100%" }}
        >
          <MapContainer
            key={mapKey}
            center={[selectedPosition.lat, selectedPosition.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
            attributionControl={true}
          >
            <MapResizer center={selectedPosition} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            {selectedPosition && (
              <Marker
                position={[selectedPosition.lat, selectedPosition.lng]}
                icon={orangePinIcon}
              />
            )}
          </MapContainer>
        </div>

        {/* Coordinates Display */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={selectedPosition ? selectedPosition.lat.toFixed(6) : ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={selectedPosition ? selectedPosition.lng.toFixed(6) : ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={
                loadingAddress
                  ? "Loading address..."
                  : address || "Click on the map to select a location"
              }
              readOnly
              placeholder="Click on the map to select a location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedPosition
                ? "bg-[#FA8630] text-white hover:bg-[#E87928]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <CheckIcon className="h-5 w-5" />
            Confirm Location
          </button>
        </div>
      </div>

      {/* Inline styles to ensure Leaflet displays correctly */}
      <style>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
        }
        .leaflet-pane,
        .leaflet-tile,
        .leaflet-marker-icon,
        .leaflet-marker-shadow,
        .leaflet-tile-container,
        .leaflet-pane > svg,
        .leaflet-pane > canvas,
        .leaflet-zoom-box,
        .leaflet-image-layer,
        .leaflet-layer {
          position: absolute;
          left: 0;
          top: 0;
        }
        .leaflet-container {
          overflow: hidden;
        }
        .leaflet-marker-icon,
        .leaflet-marker-shadow {
          display: block;
        }
        .leaflet-tile {
          filter: inherit;
          visibility: hidden;
        }
        .leaflet-tile-loaded {
          visibility: inherit;
        }
      `}</style>
    </div>
  );
};

export default ClinicLocationPicker;
