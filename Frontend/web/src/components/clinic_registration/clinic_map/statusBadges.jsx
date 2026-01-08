/**
 * Status badge components for clinic and inspection status
 */

export const getStatusBadge = (status) => {
  const styles = {
    Active: "bg-green-50 text-green-700 border border-green-200",
    "Temporarily Closed":
      "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Suspended: "bg-red-50 text-red-700 border border-red-200",
    Inactive: "bg-gray-50 text-gray-700 border border-gray-200",
    Pending: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
        styles[status] || styles.Active
      }`}
    >
      {status}
    </span>
  );
};

export const getInspectionBadge = (status) => {
  const styles = {
    Passed: "bg-green-50 text-green-700 border border-green-200",
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    "Needs Follow-up": "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
};

