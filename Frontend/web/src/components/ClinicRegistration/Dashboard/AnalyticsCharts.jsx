import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartBarIcon } from "@heroicons/react/24/outline";

/**
 * AnalyticsCharts - Component for displaying analytics and trends
 */
const AnalyticsCharts = ({ data, onViewDetails }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-[#FA8630]" />
          Analytics & Trends
        </h2>
        <div className="text-center py-12 text-gray-500">
          Loading analytics data...
        </div>
      </div>
    );
  }

  const {
    registrationTrends = [],
    statusDistribution = [],
    topBarangays = [],
    approvalRate = {},
  } = data;

  // Transform registration trends for chart
  const trendsData = registrationTrends.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    total: item.count,
    approved: item.approved,
    rejected: item.rejected,
  }));

  // Transform status distribution for pie chart
  const statusData = statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  // Transform barangays data
  const barangayData = topBarangays.map((item) => ({
    name: item.barangay || "Unknown",
    clinics: item.count,
  }));

  const COLORS = {
    Active: "#10B981",
    Pending: "#F59E0B",
    Rejected: "#EF4444",
    Inactive: "#6B7280",
    Suspended: "#DC2626",
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-[#FA8630]" />
          Analytics & Trends
        </h2>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-[#FA8630] hover:text-[#E87928] font-medium"
          >
            View Details →
          </button>
        )}
      </div>

      {/* Approval Rate Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-900">
            {approvalRate.total_processed || 0}
          </div>
          <div className="text-xs text-blue-700">Total Processed</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900">
            {approvalRate.approval_percentage || 0}%
          </div>
          <div className="text-xs text-green-700">Approval Rate</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-900">
            {approvalRate.rejected || 0}
          </div>
          <div className="text-xs text-amber-700">Rejected</div>
        </div>
      </div>

      {/* Registration Trends Chart */}
      {trendsData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Registration Trends (Last 12 Months)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" style={{ fontSize: "12px" }} />
              <YAxis style={{ fontSize: "12px" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#FA8630"
                strokeWidth={2}
                name="Total"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#10B981"
                strokeWidth={2}
                name="Approved"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#EF4444"
                strokeWidth={2}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        {statusData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#6B7280"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Barangays */}
        {barangayData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Top Barangays
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barangayData.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" style={{ fontSize: "12px" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  style={{ fontSize: "10px" }}
                  width={80}
                />
                <Tooltip />
                <Bar dataKey="clinics" fill="#FA8630" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export { AnalyticsCharts };
