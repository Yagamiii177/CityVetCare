import React from "react";

/**
 * MetricsCard - Reusable card component for displaying key metrics
 *
 * @param {string} title - Card title
 * @param {number} value - Metric value to display
 * @param {React.Component} icon - Heroicon component
 * @param {string} color - Color theme (blue, amber, green, red, gray)
 * @param {boolean} urgent - Whether to highlight as urgent
 * @param {function} onClick - Click handler
 */
const MetricsCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  urgent = false,
  onClick,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-blue-900",
      hover: "hover:bg-blue-100",
      border: "border-blue-200",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      value: "text-amber-900",
      hover: "hover:bg-amber-100",
      border: "border-amber-200",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      value: "text-green-900",
      hover: "hover:bg-green-100",
      border: "border-green-200",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      value: "text-red-900",
      hover: "hover:bg-red-100",
      border: "border-red-200",
    },
    gray: {
      bg: "bg-gray-50",
      icon: "text-gray-600",
      value: "text-gray-900",
      hover: "hover:bg-gray-100",
      border: "border-gray-200",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`
        ${classes.bg} ${classes.hover} ${classes.border}
        ${urgent ? "ring-2 ring-amber-400 ring-offset-2 animate-pulse" : ""}
        border rounded-lg p-5 text-left transition-all duration-200
        hover:shadow-lg transform hover:-translate-y-0.5
        w-full
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${classes.bg}`}>
          <Icon className={`h-6 w-6 ${classes.icon}`} />
        </div>
        {urgent && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
            ACTION REQUIRED
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold ${classes.value} mb-1`}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
    </button>
  );
};

export { MetricsCard };
