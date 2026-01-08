import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import { apiService } from "../../utils/api";
import {
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  EyeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = [
  "#FA8630",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

const toTitle = (value) => {
  const s = String(value || "")
    .replace(/_/g, " ")
    .trim();
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const sum = (arr, key) =>
  (arr || []).reduce((acc, item) => acc + (Number(item?.[key]) || 0), 0);

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalStrays: 0,
    statusCounts: {},
    adoptionRequestCounts: {},
    redemptionRequestCounts: {},
  });
  const [timeSeries, setTimeSeries] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.strayAnimals.getDashboardStats();
        const payload = response?.data?.data;

        if (!isMounted) return;

        setMetrics({
          totalStrays: Number(payload?.metrics?.totalStrays) || 0,
          statusCounts: payload?.metrics?.statusCounts || {},
          adoptionRequestCounts: payload?.metrics?.adoptionRequestCounts || {},
          redemptionRequestCounts:
            payload?.metrics?.redemptionRequestCounts || {},
        });

        setTimeSeries(
          Array.isArray(payload?.timeSeries) ? payload.timeSeries : []
        );
        setRecentActivities(
          Array.isArray(payload?.recentActivities)
            ? payload.recentActivities
            : []
        );
      } catch (e) {
        if (!isMounted) return;
        console.error("Error fetching stray dashboard data:", e);
        setError("Unable to load dashboard data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartSeries = useMemo(() => {
    return (timeSeries || []).map((row) => {
      const dateStr = row?.date;
      let label = dateStr;
      try {
        label = dateStr ? format(parseISO(dateStr), "MMM d") : "";
      } catch {
        label = dateStr;
      }

      return {
        ...row,
        label,
        registeredStrays: Number(row?.registeredStrays) || 0,
        adoptionRequests: Number(row?.adoptionRequests) || 0,
        adoptionApproved: Number(row?.adoptionApproved) || 0,
        adoptionPending: Number(row?.adoptionPending) || 0,
        adoptionRejected: Number(row?.adoptionRejected) || 0,
      };
    });
  }, [timeSeries]);

  const statusPieData = useMemo(() => {
    const counts = metrics?.statusCounts || {};
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: toTitle(name),
        value: Number(value) || 0,
      }))
      .filter((d) => d.value > 0);
  }, [metrics]);

  const adoptionStatusBarData = useMemo(() => {
    const counts = metrics?.adoptionRequestCounts || {};
    const ordered = ["pending", "approved", "rejected", "archived"];
    return ordered
      .map((k) => ({ name: toTitle(k), value: Number(counts?.[k]) || 0 }))
      .filter((d) => d.value > 0);
  }, [metrics]);

  const capturedCount = Number(metrics?.statusCounts?.captured) || 0;
  const adoptionListCount = Number(metrics?.statusCounts?.adoption) || 0;
  const adoptedCount =
    (Number(metrics?.statusCounts?.adopted) || 0) +
    (Number(metrics?.statusCounts?.claimed) || 0);
  const pendingAdoptionRequests =
    Number(metrics?.adoptionRequestCounts?.pending) || 0;
  const pendingRedemptionRequests =
    Number(metrics?.redemptionRequestCounts?.pending) || 0;

  const newStraysLast7Days = useMemo(() => {
    const last7 = (chartSeries || []).slice(-7);
    return sum(last7, "registeredStrays");
  }, [chartSeries]);

  const approvedAdoptionsLast30Days = useMemo(
    () => sum(chartSeries, "adoptionApproved"),
    [chartSeries]
  );

  const activityIcon = (type) => {
    if (type === "stray_registered") {
      return <PlusIcon className="h-4 w-4 text-[#FA8630]" />;
    }
    if (type === "adoption_requested") {
      return <HeartIcon className="h-4 w-4 text-[#FA8630]" />;
    }
    if (type === "redemption_requested") {
      return <EyeIcon className="h-4 w-4 text-[#FA8630]" />;
    }
    return <ClockIcon className="h-4 w-4 text-[#FA8630]" />;
  };

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
              value={metrics.totalStrays}
              trend="neutral"
              change={`${metrics.totalStrays} total`}
            />
            <MetricCard
              icon={<ShieldCheckIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Captured"
              value={capturedCount}
              trend="neutral"
              change="Currently in custody"
            />
            <MetricCard
              icon={<EyeIcon className="h-6 w-6 text-[#FA8630]" />}
              title="In Adoption List"
              value={adoptionListCount}
              trend="neutral"
              change="Available for adoption"
            />
            <MetricCard
              icon={<HeartIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Adopted"
              value={adoptedCount}
              trend="neutral"
              change="Adoptions completed"
            />
          </div>

          {/* Charts and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Intake & Adoption Trend */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Stray Intake & Adoption
                  </h2>
                  <span className="text-sm text-gray-500">Last 30 days</span>
                </div>
                <ChartBarIcon className="h-6 w-6 text-[#FA8630]" />
              </div>

              <div className="h-64 w-full min-w-0">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
                  </div>
                ) : error ? (
                  <div className="h-full bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-10 w-10 text-[#FA8630]" />
                    <span className="ml-2 text-gray-600">
                      Dashboard data unavailable
                    </span>
                  </div>
                ) : chartSeries.length === 0 ? (
                  <div className="h-full bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-10 w-10 text-[#FA8630]" />
                    <span className="ml-2 text-gray-600">
                      No data to display
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartSeries}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRegistered"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#FA8630"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#FA8630"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorApproved"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorRequests"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        name="Registered Strays"
                        dataKey="registeredStrays"
                        stroke="#FA8630"
                        fillOpacity={1}
                        fill="url(#colorRegistered)"
                      />
                      <Area
                        type="monotone"
                        name="Adoption Requests"
                        dataKey="adoptionRequests"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorRequests)"
                      />
                      <Area
                        type="monotone"
                        name="Adoptions Approved"
                        dataKey="adoptionApproved"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#colorApproved)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {error ? (
                <p className="text-sm text-red-600 mt-3">{error}</p>
              ) : null}
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <StatItem
                  icon={<PlusIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="New Strays"
                  value={newStraysLast7Days}
                  description="Last 7 days"
                  trend="neutral"
                />
                <StatItem
                  icon={<ClockIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Pending Adoption Requests"
                  value={pendingAdoptionRequests}
                  description="Awaiting approval"
                  trend="neutral"
                />
                <StatItem
                  icon={<CalendarIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Pending Redemption Requests"
                  value={pendingRedemptionRequests}
                  description="Awaiting processing"
                  trend="neutral"
                />
              </div>
              <div className="mt-6 p-3 rounded-lg bg-[#FA8630]/5">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    Approved adoptions (30 days):
                  </span>{" "}
                  {approvedAdoptionsLast30Days}
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Stray Status Breakdown
                </h2>
                <span className="text-sm text-gray-500">Current</span>
              </div>
              <div className="h-64 w-full min-w-0">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
                  </div>
                ) : error ? (
                  <div className="h-full bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-10 w-10 text-[#FA8630]" />
                    <span className="ml-2 text-gray-600">
                      Dashboard data unavailable
                    </span>
                  </div>
                ) : statusPieData.length === 0 ? (
                  <div className="h-full bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-10 w-10 text-[#FA8630]" />
                    <span className="ml-2 text-gray-600">
                      No data to display
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {statusPieData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Adoption Requests by Status
                </h2>
                <span className="text-sm text-gray-500">Current</span>
              </div>
              <div className="h-64 w-full min-w-0">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
                  </div>
                ) : error ? (
                  <div className="h-full bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-10 w-10 text-[#FA8630]" />
                    <span className="ml-2 text-gray-600">
                      Dashboard data unavailable
                    </span>
                  </div>
                ) : adoptionStatusBarData.length === 0 ? (
                  <div className="h-full bg-[#FA8630]/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-10 w-10 text-[#FA8630]" />
                    <span className="ml-2 text-gray-600">
                      No data to display
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={adoptionStatusBarData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        name="Requests"
                        fill="#FA8630"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activities
              </h2>
            </div>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
              </div>
            ) : recentActivities.length ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const when = activity?.timestamp
                    ? new Date(activity.timestamp).toLocaleString()
                    : "";
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start py-3 px-2 rounded-lg hover:bg-[#FA8630]/5 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">
                        {activityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{when}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
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
        <div className="text-sm flex items-center text-gray-500">
          {trend === "up" ? (
            <ArrowUpIcon className="h-4 w-4 mr-1 text-green-500" />
          ) : null}
          {trend === "down" ? (
            <ArrowDownIcon className="h-4 w-4 mr-1 text-yellow-500" />
          ) : null}
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
