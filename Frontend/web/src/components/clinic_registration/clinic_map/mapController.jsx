import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Component to handle map view changes and bounds
 * Automatically adjusts map view based on selected clinic or filtered clinics
 */
const MapController = ({ selectedClinic, filteredClinics }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedClinic && selectedClinic.latitude && selectedClinic.longitude) {
      // Zoom to selected clinic
      map.flyTo([selectedClinic.latitude, selectedClinic.longitude], 16, {
        duration: 1.5,
      });
    } else if (filteredClinics && filteredClinics.length > 0) {
      // Fit bounds to show all filtered clinics
      const bounds = filteredClinics
        .filter((c) => c.latitude && c.longitude)
        .map((c) => [c.latitude, c.longitude]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [selectedClinic, filteredClinics, map]);

  return null;
};

export default MapController;

