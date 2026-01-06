import { useState, useCallback, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { XMarkIcon, MapPinIcon, CheckIcon } from "@heroicons/react/24/outline";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  className: 'custom-pin-marker',
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

/**
 * MapLocationPicker Component
 * Allows users to pin a location on a map and get latitude/longitude coordinates
 * 
 * @param {boolean} isOpen - Whether the picker modal is open
 * @param {function} onClose - Callback to close the picker
 * @param {function} onLocationSelect - Callback when location is selected (receives { lat, lng, address })
 * @param {object} initialPosition - Optional initial position { lat, lng }
 */
const MapLocationPicker = ({ isOpen, onClose, onLocationSelect, initialPosition = null }) => {
  // Default to Naga City, Philippines
  const [selectedPosition, setSelectedPosition] = useState(initialPosition || { lat: 13.6218, lng: 123.1948 });
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef(null);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen && initialPosition) {
      setSelectedPosition(initialPosition);
    }
  }, [isOpen, initialPosition]);

  // Reverse geocode to get address from coordinates
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    setLoadingAddress(true);
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const displayAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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
  const handleMapClick = useCallback((latlng) => {
    setSelectedPosition(latlng);
    getAddressFromCoordinates(latlng.lat, latlng.lng);
  }, [getAddressFromCoordinates]);

  // Handle confirm button
  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect({
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        address: address || `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`
      });
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedPosition(initialPosition || { lat: 13.6218, lng: 123.1948 });
    setAddress("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="bg-[#FA8630] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">Pin Incident Location</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-800">
            <strong>📍 Click anywhere on the map</strong> to pin the incident location. The coordinates and address will be captured automatically.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative" style={{ height: '200px', width: '100%' }}>
          <MapContainer
            center={[selectedPosition.lat, selectedPosition.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

        {/* Location Info */}
        <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
              <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm text-gray-800">
                {selectedPosition ? selectedPosition.lat.toFixed(6) : 'Not selected'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
              <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm text-gray-800">
                {selectedPosition ? selectedPosition.lng.toFixed(6) : 'Not selected'}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800">
              {loadingAddress ? (
                <span className="text-gray-400">Loading address...</span>
              ) : address ? (
                address
              ) : (
                <span className="text-gray-400">Click on the map to select a location</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 flex gap-3 justify-end bg-white">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className="px-6 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-5 w-5" />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
