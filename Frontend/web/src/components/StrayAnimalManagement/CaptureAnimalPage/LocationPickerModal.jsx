import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { XMarkIcon, MapPinIcon, CheckIcon } from "@heroicons/react/24/outline";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom orange marker icon
const customIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

const LocationPickerModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
}) => {
  // Default to Manila, Philippines
  const defaultPosition = { lat: 14.5995, lng: 120.9842 };
  const [position, setPosition] = useState(initialLocation || defaultPosition);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Get address when position changes
  useEffect(() => {
    if (position) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position]);

  // Try to get user's current location on mount
  useEffect(() => {
    if (isOpen && !initialLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPosition = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setPosition(newPosition);
          },
          () => {
            console.log("Location access denied, using default location");
          }
        );
      }
    }
  }, [isOpen, initialLocation]);

  useEffect(() => {
    if (isOpen && initialLocation && mapInstance) {
      mapInstance.setView(
        [initialLocation.lat, initialLocation.lng],
        mapInstance.getZoom() || 15
      );
    }
  }, [isOpen, initialLocation, mapInstance]);

  useEffect(() => {
    if (isOpen && mapInstance && position) {
      mapInstance.setView([position.lat, position.lng]);
    }
  }, [position, isOpen, mapInstance]);

  // Ensure map recalculates size when modal opens
  useEffect(() => {
    if (isOpen && mapInstance) {
      setTimeout(() => {
        if (mapInstance?.invalidateSize) {
          mapInstance.invalidateSize();
        }
      }, 200);
    }
  }, [isOpen, mapInstance]);

  const handleConfirm = () => {
    onSelectLocation({
      latitude: position.lat,
      longitude: position.lng,
      address: address,
    });
    onClose();
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstance) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        // Smoothly fly to user's location
        mapInstance.flyTo(
          [coords.lat, coords.lng],
          Math.max(mapInstance.getZoom() || 15, 15),
          {
            animate: true,
            duration: 0.8,
          }
        );
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-7 w-7" />
            <h2 className="text-2xl font-bold">Select Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Address Display */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <MapPinIcon className="h-5 w-5 text-[#FA8630] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">
                SELECTED LOCATION
              </p>
              {isLoadingAddress ? (
                <p className="text-gray-700 animate-pulse">
                  Loading address...
                </p>
              ) : (
                <p className="text-gray-800 font-medium leading-relaxed">
                  {address}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Coordinates: {position.lat.toFixed(6)},{" "}
                {position.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[55vh] min-h-[320px]">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            whenCreated={(map) => setMapInstance(map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>

          {/* Locate Me Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className={`px-3 py-2 rounded-lg text-sm font-medium shadow bg-white border border-gray-300 hover:bg-gray-50 ${
                locating ? "opacity-60 cursor-not-allowed" : ""
              }`}
              title="Center map to your location"
            >
              {locating ? "Locating..." : "My Location"}
            </button>
          </div>

          {/* Instruction Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10">
            <p className="text-sm text-gray-700 font-medium">
              Click on the map to select a location
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <CheckIcon className="h-5 w-5" />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
