import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * ActivityLog - Component to display recent system activity
 */
const ActivityLog = ({ activities = [], loading = false }) => {
  const getActivityIcon = (icon) => {
    switch (icon) {
      case "check":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "x":
        return <XCircleIcon className="h-5 w-5" />;
      case "clock":
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };

  const getActivityColor = (color) => {
    const colors = {
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
      amber: "bg-amber-100 text-amber-700",
      gray: "bg-gray-100 text-gray-700",
    };
    return colors[color] || colors.gray;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ClockIcon className="h-6 w-6 text-[#FA8630]" />
        Activity & System Logs
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-[#FA8630] animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`p-2 rounded-full ${getActivityColor(
                  activity.color
                )}`}
              >
                {getActivityIcon(activity.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { ActivityLog };
