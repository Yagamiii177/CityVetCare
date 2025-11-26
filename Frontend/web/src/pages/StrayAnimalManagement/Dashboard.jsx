import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import {
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  EyeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  CheckBadgeIcon,
  ClockIcon as ClockSolidIcon,
} from "@heroicons/react/24/solid";

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Sample data - replace with actual API calls
  const dashboardData = {
    totalStrays: 142,
    totalAdoptions: 68,
    observationAnimals: 23,
    vaccinatedAnimals: 89,
    recentAdoptions: 5,
    pendingAdoptions: 12,
    upcomingAppointments: 7,
  };

  const recentActivities = [
    {
      id: 1,
      action: "New stray registered",
      time: "2 hours ago",
      icon: <PlusIcon className="h-4 w-4 text-[#FA8630]" />,
    },
    {
      id: 2,
      action: "Adoption approved",
      time: "5 hours ago",
      icon: <CheckBadgeIcon className="h-4 w-4 text-green-500" />,
    },
    {
      id: 3,
      action: "Medical checkup completed",
      time: "1 day ago",
      icon: <ShieldCheckIcon className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 4,
      action: "3 animals vaccinated",
      time: "1 day ago",
      icon: <ShieldCheckIcon className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - City Veterinarian" }}
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<UserGroupIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Total Registered Strays"
              value={dashboardData.totalStrays}
              trend="up"
              change="+12% from last month"
            />
            <MetricCard
              icon={<HeartIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Total Adoptions"
              value={dashboardData.totalAdoptions}
              trend="up"
              change="+8% from last month"
            />
            <MetricCard
              icon={<EyeIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Animals Under Observation"
              value={dashboardData.observationAnimals}
              trend="down"
              change="-3 from yesterday"
            />
            <MetricCard
              icon={<ShieldCheckIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Vaccinated Animals"
              value={dashboardData.vaccinatedAnimals}
              trend="up"
              change="+15 this week"
            />
          </div>

          {/* Charts and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Adoption Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Adoption Trends
                </h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              <div className="h-64 bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-12 w-12 text-[#FA8630]" />
                <span className="ml-2 text-gray-500">
                  Chart will appear here
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <StatItem
                  icon={<HeartIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Recent Adoptions"
                  value={dashboardData.recentAdoptions}
                  description="Today"
                  trend="up"
                />
                <StatItem
                  icon={<ClockSolidIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Pending Adoptions"
                  value={dashboardData.pendingAdoptions}
                  description="Waiting approval"
                  trend="neutral"
                />
                <StatItem
                  icon={<CalendarIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Upcoming Appointments"
                  value={dashboardData.upcomingAppointments}
                  description="Next 7 days"
                  trend="up"
                />
              </div>
            </div>
          </div>

          {/* Recent Activities */}
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
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start py-3 px-2 rounded-lg hover:bg-[#FA8630]/5 transition-colors"
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

// Component for metric cards
const MetricCard = ({ icon, title, value, trend, change }) => {
  return (
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
};

// Component for stat items
const StatItem = ({ icon, title, value, description, trend }) => {
  return (
    <div className="flex items-center p-3 hover:bg-[#FA8630]/5 rounded-lg transition-colors">
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
          {trend === "up" && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
          {trend === "down" && (
            <ArrowDownIcon className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
