import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import {
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  BellAlertIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MapPinIcon,
  CheckBadgeIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

const IncidentDashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Sample API-like values
  const dashboardData = {
    totalReports: 256,
    resolvedReports: 132,
    pendingReports: 67,
    reportsThisWeek: 21,
  };

  const recentIncidents = [
    {
      id: 1,
      action: "New bite incident reported",
      time: "1 hour ago",
      icon: <PlusIcon className="h-4 w-4 text-[#FA8630]" />,
    },
    {
      id: 2,
      action: "Report verified by City Vet",
      time: "3 hours ago",
      icon: <CheckBadgeIcon className="h-4 w-4 text-green-500" />,
    },
    {
      id: 3,
      action: "Patrol dispatched",
      time: "8 hours ago",
      icon: <MapPinIcon className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "City Veterinarian" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Incident Reports Dashboard
          </h1>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={
                <ExclamationTriangleIcon className="h-6 w-6 text-[#FA8630]" />
              }
              title="Total Incident Reports"
              value={dashboardData.totalReports}
              trend="up"
              change="+10% vs last month"
            />

            <MetricCard
              icon={
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-[#FA8630]" />
              }
              title="Resolved Reports"
              value={dashboardData.resolvedReports}
              trend="up"
              change="+6 this week"
            />

            <MetricCard
              icon={<ClockIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Pending Verification"
              value={dashboardData.pendingReports}
              trend="down"
              change="-4 from yesterday"
            />

            <MetricCard
              icon={<BellAlertIcon className="h-6 w-6 text-[#FA8630]" />}
              title="New This Week"
              value={dashboardData.reportsThisWeek}
              trend="up"
              change="+8 vs last week"
            />
          </div>

          {/* Placeholder for charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Incident Reporting Trend
                </h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>

              <div className="h-64 bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                {/* Your chart component will go here */}
                <span className="text-gray-600">Chart Placeholder</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Stats
              </h2>

              <div className="space-y-4">
                <StatItem
                  icon={<PlusIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="New Reports Today"
                  value={4}
                  description="New incidents logged"
                  trend="up"
                />

                <StatItem
                  icon={<MapPinIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Patrols Dispatched"
                  value={2}
                  description="Ongoing field response"
                  trend="neutral"
                />

                <StatItem
                  icon={
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-[#FA8630]" />
                  }
                  title="Verified Reports"
                  value={dashboardData.resolvedReports}
                  description="Total verified cases"
                  trend="up"
                />
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activities
              </h2>
              <button className="text-sm text-[#FA8630] hover:text-[#E87928]">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentIncidents.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start py-3 px-2 rounded-lg hover:bg-[#FA8630]/5"
                >
                  <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Metric Card
const MetricCard = ({ icon, title, value, trend, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>

      <div
        className={`text-sm flex items-center ${
          trend === "up" ? "text-green-500" : "text-yellow-500"
        }`}
      >
        {trend === "up" ? (
          <ArrowUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 mr-1" />
        )}
        {change}
      </div>
    </div>
  </div>
);

// Stat Item
const StatItem = ({ icon, title, value, description, trend }) => (
  <div className="flex items-center p-3 hover:bg-[#FA8630]/5 rounded-lg">
    <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-lg font-bold text-gray-800 mr-2">
            {value}
          </span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
        {trend === "up" && (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        )}
        {trend === "down" && (
          <ArrowDownIcon className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    </div>
  </div>
);

export default IncidentDashboard;
