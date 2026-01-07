import { BellAlertIcon } from "@heroicons/react/24/outline";

/**
 * Alert panel for displaying clinic monitoring alerts
 */
const AlertPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BellAlertIcon className="h-5 w-5 text-[#FA8630]" />
        <h2 className="text-lg font-semibold text-gray-800">
          Active Alerts ({alerts.length})
        </h2>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${
              alert.type === "danger"
                ? "bg-red-50 border-red-200"
                : alert.type === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <p className="text-sm font-medium text-gray-900">{alert.clinic}</p>
            <p className="text-xs text-gray-600">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel;
