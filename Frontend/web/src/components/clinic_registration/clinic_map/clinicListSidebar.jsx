import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { getStatusBadge, getInspectionBadge } from "./StatusBadges";

/**
 * Sidebar showing list of clinics with monitoring information
 */
const ClinicListSidebar = ({ clinics, selectedClinic, onSelectClinic }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
        Clinics ({clinics.length})
      </h2>
      <div className="space-y-3">
        {clinics.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No clinics found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          clinics.map((clinic) => (
            <div
              key={clinic.id}
              onClick={() => onSelectClinic(clinic)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedClinic?.id === clinic.id
                  ? "border-[#FA8630] bg-[#FA8630]/5 shadow-md"
                  : "border-gray-200 hover:border-[#FA8630]/50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
                  {clinic.name}
                </h3>
                {getStatusBadge(clinic.status)}
              </div>

              <p className="text-xs text-gray-600 mb-2 flex items-start gap-1">
                <MapPinIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{clinic.address}</span>
              </p>

              {clinic.barangay && (
                <p className="text-xs text-gray-500 mb-2">
                  Barangay {clinic.barangay}
                </p>
              )}

              {/* Monitoring Info */}
              <div className="space-y-1 pt-2 border-t border-gray-100">
                {clinic.inspectionStatus && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Inspection:</span>
                    {getInspectionBadge(clinic.inspectionStatus)}
                  </div>
                )}
                {clinic.permitExpiryDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <CalendarDaysIcon className="h-3 w-3" />
                    <span>
                      Permit:{" "}
                      {new Date(clinic.permitExpiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {clinic.lastActivityDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3" />
                    <span>
                      Last active:{" "}
                      {new Date(clinic.lastActivityDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicListSidebar;

