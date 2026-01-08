import React from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../../../utils/api";

/**
 * AlertsPanel - Component for displaying system alerts
 */
const AlertsPanel = ({ alerts = [], onRefresh }) => {
  const handleDismiss = async (alertId) => {
    try {
      await apiService.adminDashboard.dismissAlert(alertId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "danger":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getAlertStyles = (type, priority) => {
    if (priority === "high") {
      return {
        container: "bg-red-50 border-red-300",
        icon: "text-red-600",
        text: "text-red-900",
        dismiss: "text-red-600 hover:text-red-800",
      };
    }

    switch (type) {
      case "warning":
        return {
          container: "bg-amber-50 border-amber-300",
          icon: "text-amber-600",
          text: "text-amber-900",
          dismiss: "text-amber-600 hover:text-amber-800",
        };
      case "danger":
        return {
          container: "bg-red-50 border-red-300",
          icon: "text-red-600",
          text: "text-red-900",
          dismiss: "text-red-600 hover:text-red-800",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-300",
          icon: "text-blue-600",
          text: "text-blue-900",
          dismiss: "text-blue-600 hover:text-blue-800",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-300",
          icon: "text-gray-600",
          text: "text-gray-900",
          dismiss: "text-gray-600 hover:text-gray-800",
        };
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  // Sort alerts by priority
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert) => {
        const styles = getAlertStyles(alert.type, alert.priority);

        return (
          <div
            key={alert.id}
            className={`${styles.container} border rounded-lg p-4 flex items-start gap-3`}
          >
            <div className={styles.icon}>{getAlertIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${styles.text} mb-1`}>
                {alert.title}
              </h4>
              <p className={`text-sm ${styles.text}`}>{alert.message}</p>
              {alert.category && (
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                  {alert.category}
                </span>
              )}
            </div>
            {alert.dismissible && (
              <button
                onClick={() => handleDismiss(alert.id)}
                className={`${styles.dismiss} p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors`}
                title="Dismiss"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { AlertsPanel };
