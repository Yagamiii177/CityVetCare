import L from "leaflet";

// Custom icons for clinics with different status colors
export const createCustomIcon = (color) => {
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
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Predefined icons for different clinic statuses
export const clinicIcons = {
  active: createCustomIcon("#10B981"), // Green for Active
  temporaryClosed: createCustomIcon("#F59E0B"), // Yellow for Temporarily Closed
  suspended: createCustomIcon("#EF4444"), // Red for Suspended
  inactive: createCustomIcon("#6B7280"), // Gray for Inactive
};

export const getIconByStatus = (status) => {
  switch (status) {
    case "Active":
      return clinicIcons.active;
    case "Temporarily Closed":
      return clinicIcons.temporaryClosed;
    case "Suspended":
      return clinicIcons.suspended;
    case "Inactive":
      return clinicIcons.inactive;
    default:
      return clinicIcons.active;
  }
};

