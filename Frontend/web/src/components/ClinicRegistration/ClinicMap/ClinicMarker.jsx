import { Marker, Popup } from "react-leaflet";
import { MapPinIcon, PhoneIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getIconByStatus } from "./MapIcons";
import { getStatusBadge } from "./StatusBadges";

/**
 * Individual clinic marker component with popup information
 */
const ClinicMarker = ({ clinic, onSelect }) => {
  if (!clinic.latitude || !clinic.longitude) {
    return null;
  }

  return (
    <Marker
      position={[clinic.latitude, clinic.longitude]}
      icon={getIconByStatus(clinic.status)}
      eventHandlers={{
        click: () => {
          onSelect(clinic);
        },
      }}
    >
      <Popup maxWidth={300}>
        <div className="p-2 min-w-[250px]">
          <h3 className="font-bold text-gray-900 mb-2 text-base">
            {clinic.name}
          </h3>
          <div className="mb-3">{getStatusBadge(clinic.status)}</div>

          <div className="space-y-2 text-sm">
            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-600" />
              <div>
                <p className="text-gray-900">{clinic.address}</p>
                {clinic.barangay && (
                  <p className="text-gray-500 text-xs">
                    Barangay {clinic.barangay}
                  </p>
                )}
              </div>
            </div>

            {/* Contact */}
            {clinic.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-gray-600" />
                <span className="text-gray-900">{clinic.phone}</span>
              </div>
            )}

            {/* Veterinarian */}
            {clinic.veterinarian && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Head Veterinarian</p>
                <p className="text-gray-900 font-medium">
                  {clinic.veterinarian}
                </p>
              </div>
            )}

            {/* Operating Hours */}
            {clinic.operatingHours && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <ClockIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-600" />
                  <div className="text-xs text-gray-700">
                    {typeof clinic.operatingHours === "string"
                      ? clinic.operatingHours
                      : JSON.stringify(clinic.operatingHours)}
                  </div>
                </div>
              </div>
            )}

            {/* Services */}
            {clinic.services && clinic.services.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Services Offered:</p>
                <div className="flex flex-wrap gap-1">
                  {clinic.services.slice(0, 4).map((service, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {service}
                    </span>
                  ))}
                  {clinic.services.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{clinic.services.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default ClinicMarker;
