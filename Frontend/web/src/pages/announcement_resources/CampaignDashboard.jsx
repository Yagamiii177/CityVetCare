import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/announcement_resources/drawer";
import {
  ChartBarIcon,
  MegaphoneIcon,
  ClockIcon,
  BookOpenIcon,
  EyeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  TagIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import campaignAnalyticsService from "../../services/campaignAnalyticsService";
import { useNavigate } from "react-router-dom";

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Analytics data
  const [overview, setOverview] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [materialsOverview, setMaterialsOverview] = useState(null);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log("Fetching campaign analytics data...");

      // Fetch overview and materials (required)
      const [overviewData, materialsData] = await Promise.all([
        campaignAnalyticsService.getOverview().catch((err) => {
          console.error("Overview error:", err);
          return null;
        }),
        campaignAnalyticsService.getMaterialsOverview().catch((err) => {
          console.error("Materials error:", err);
          return null;
        }),
      ]);

      // Fetch optional data (won't block dashboard if they fail)
      const engagementData = await campaignAnalyticsService
        .getEngagement(30)
        .catch((err) => {
          console.warn(
            "Engagement metrics unavailable:",
            err.response?.data?.error
          );
          return { data: null };
        });

      const statusData = await campaignAnalyticsService
        .getStatusSummary()
        .catch((err) => {
          console.warn(
            "Status summary unavailable:",
            err.response?.data?.error
          );
          return { data: null };
        });

      const performanceData = await campaignAnalyticsService
        .getPerformance(selectedPeriod)
        .catch((err) => {
          console.warn(
            "Performance metrics unavailable:",
            err.response?.data?.error
          );
          return { data: null };
        });

      console.log("Overview Data:", overviewData);
      console.log("Materials Data:", materialsData);

      setOverview(overviewData?.data || null);
      setEngagement(engagementData?.data || null);
      setStatusSummary(statusData?.data || null);
      setPerformance(performanceData?.data || null);
      setMaterialsOverview(materialsData?.data || null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-[#FA8630] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign analytics...</p>
        </div>
      </div>
    );
  }

  // Show error message if data fetch failed
  if (!loading && !overview) {
    return (
      <div className="min-h-screen bg-[#E8E8E8]">
        <Header
          isDrawerOpen={isDrawerOpen}
          toggleDrawer={toggleDrawer}
          user={{ name: "Campaign Manager" }}
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
          <div className="px-6 py-8 flex items-center justify-center min-h-[50vh]">
            <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Unable to Load Analytics
              </h2>
              <p className="text-gray-600 mb-4">
                There was an error fetching campaign data. Please ensure the
                backend server is running.
              </p>
              <button
                onClick={handleRefresh}
                className="bg-[#FA8630] hover:bg-[#E87928] text-white px-6 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Campaign Manager" }}
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
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <ChartBarIcon className="h-8 w-8 text-[#FA8630] mr-3" />
                Campaign Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor announcements and reading materials performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630]/20 focus:border-[#FA8630] outline-none"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-[#FA8630] hover:bg-[#E87928] text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<MegaphoneIcon className="h-6 w-6 text-white" />}
              title="Total Announcements"
              value={overview?.announcements?.total_announcements || 0}
              subtitle={`${overview?.announcements?.published || 0} Published`}
              color="bg-gradient-to-r from-[#FA8630] to-[#FF9A3D]"
              growth={performance?.growth?.announcements}
            />
            <MetricCard
              icon={<EyeIcon className="h-6 w-6 text-white" />}
              title="Total Views"
              value={(
                overview?.announcements?.total_views || 0
              ).toLocaleString()}
              subtitle={`Avg: ${Math.round(
                overview?.announcements?.avg_views || 0
              )}`}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              growth={performance?.growth?.views}
            />
            <MetricCard
              icon={<BookOpenIcon className="h-6 w-6 text-white" />}
              title="Reading Materials"
              value={overview?.materials?.total_materials || 0}
              subtitle={`${overview?.materials?.published || 0} Published`}
              color="bg-gradient-to-r from-green-500 to-green-600"
            />
            <MetricCard
              icon={<ClockIcon className="h-6 w-6 text-white" />}
              title="Pending Items"
              value={
                (overview?.announcements?.drafts || 0) +
                (overview?.materials?.drafts || 0)
              }
              subtitle="Drafts & Scheduled"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Category Distribution */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <TagIcon className="h-5 w-5 text-[#FA8630] mr-2" />
                  Category Distribution
                </h2>
                <span className="text-sm text-gray-500">All Categories</span>
              </div>
              <div className="space-y-4">
                {overview?.categoryDistribution?.map((cat, idx) => (
                  <CategoryBar
                    key={idx}
                    category={cat.category}
                    count={cat.count}
                    views={cat.total_views || 0}
                    total={overview.announcements.total_announcements}
                  />
                ))}
                {(!overview?.categoryDistribution ||
                  overview.categoryDistribution.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No category data available
                  </div>
                )}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <FireIcon className="h-5 w-5 text-[#FA8630] mr-2" />
                Priority Breakdown
              </h2>
              <div className="space-y-4">
                {overview?.priorityDistribution?.map((priority, idx) => (
                  <PriorityItem
                    key={idx}
                    priority={priority.priority}
                    count={priority.count}
                  />
                ))}
                {(!overview?.priorityDistribution ||
                  overview.priorityDistribution.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No priority data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Viewed Announcements */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  Top Performing Announcements
                </h2>
                <button
                  onClick={() => navigate("/announcement-list")}
                  className="text-sm text-[#FA8630] hover:text-[#E87928]"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {overview?.topViewed?.slice(0, 5).map((announcement, idx) => (
                  <TopAnnouncementItem
                    key={idx}
                    rank={idx + 1}
                    announcement={announcement}
                  />
                ))}
                {(!overview?.topViewed || overview.topViewed.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No announcements yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Materials */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Recent Reading Materials
                </h2>
                <button
                  onClick={() => navigate("/reading-materials")}
                  className="text-sm text-[#FA8630] hover:text-[#E87928]"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {materialsOverview?.recentMaterials
                  ?.slice(0, 5)
                  .map((material, idx) => (
                    <MaterialItem key={idx} material={material} />
                  ))}
                {(!materialsOverview?.recentMaterials ||
                  materialsOverview.recentMaterials.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No materials yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color, growth }) => {
  const growthColor =
    growth > 0
      ? "text-green-500"
      : growth < 0
      ? "text-red-500"
      : "text-gray-500";

  return (
    <div
      className={`${color} p-6 rounded-lg text-white shadow-sm relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
        {growth !== undefined && (
          <div
            className={`flex items-center text-sm ${growthColor} bg-white px-2 py-1 rounded`}
          >
            {growth > 0 ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : growth < 0 ? (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            ) : null}
            <span>{Math.abs(growth).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-xs opacity-80">{subtitle}</p>
    </div>
  );
};

// Category Bar Component
const CategoryBar = ({ category, count, views, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const categoryColors = {
    health: "bg-red-500",
    policy: "bg-blue-500",
    events: "bg-green-500",
    general: "bg-gray-500",
  };
  const color = categoryColors[category] || categoryColors.general;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {category || "General"}
        </span>
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{count}</span>
          <span className="mx-2">•</span>
          <span>{views.toLocaleString()} views</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Priority Item Component
const PriorityItem = ({ priority, count }) => {
  const priorityConfig = {
    High: { color: "bg-red-100 text-red-700", icon: "🔴" },
    Medium: { color: "bg-yellow-100 text-yellow-700", icon: "🟡" },
    Low: { color: "bg-green-100 text-green-700", icon: "🟢" },
  };
  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#FA8630] transition-colors">
      <div className="flex items-center">
        <span className="text-xl mr-3">{config.icon}</span>
        <span className="font-medium text-gray-800">{priority} Priority</span>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {count}
      </span>
    </div>
  );
};

// Top Announcement Item Component
const TopAnnouncementItem = ({ rank, announcement }) => {
  const categoryColors = {
    health: "text-red-600",
    policy: "text-blue-600",
    events: "text-green-600",
    general: "text-gray-600",
  };

  return (
    <div className="flex items-start p-3 rounded-lg border border-gray-200 hover:border-[#FA8630] transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FA8630]/10 text-[#FA8630] font-bold text-sm mr-3 flex-shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">
          {announcement.title}
        </h4>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span
            className={`capitalize ${
              categoryColors[announcement.category] || categoryColors.general
            }`}
          >
            {announcement.category}
          </span>
          <span className="mx-2">•</span>
          <EyeIcon className="h-3 w-3 mr-1" />
          {announcement.views.toLocaleString()} views
        </div>
      </div>
    </div>
  );
};

// Material Item Component
const MaterialItem = ({ material }) => {
  const typeIcons = {
    book: "📚",
    website: "🌐",
    digital: "💻",
  };

  return (
    <div className="flex items-start p-3 rounded-lg border border-gray-200 hover:border-[#FA8630] transition-colors">
      <span className="text-2xl mr-3">{typeIcons[material.type] || "📄"}</span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">
          {material.title}
        </h4>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span className="capitalize">{material.type}</span>
          <span className="mx-2">•</span>
          <span>{new Date(material.date_created).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

// Status Item Component
const StatusItem = ({ status, count, views }) => {
  const statusConfig = {
    Published: { color: "bg-green-100 text-green-700", icon: CheckBadgeIcon },
    Scheduled: { color: "bg-blue-100 text-blue-700", icon: CalendarIcon },
    Draft: { color: "bg-yellow-100 text-yellow-700", icon: DocumentTextIcon },
  };
  const config = statusConfig[status] || statusConfig.Draft;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <Icon className="h-5 w-5 text-gray-600 mr-3" />
        <span className="font-medium text-gray-800">{status}</span>
      </div>
      <div className="text-right">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
        >
          {count}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {views.toLocaleString()} views
        </div>
      </div>
    </div>
  );
};

// Upcoming Item Component
const UpcomingItem = ({ item }) => {
  return (
    <div className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <h4 className="text-sm font-medium text-gray-800 truncate">
        {item.title}
      </h4>
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <CalendarIcon className="h-3 w-3 mr-1" />
        {new Date(item.publish_date).toLocaleString()}
      </div>
      <div className="flex items-center mt-1 text-xs">
        <span className="text-gray-600">{item.author}</span>
      </div>
    </div>
  );
};

// Attention Item Component
const AttentionItem = ({ item }) => {
  const daysSince = Math.floor(
    (new Date() - new Date(item.date_posted)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50/50 hover:border-yellow-300 transition-colors">
      <h4 className="text-sm font-medium text-gray-800 truncate">
        {item.title}
      </h4>
      <div className="flex items-center mt-2 text-xs text-gray-600">
        <ClockIcon className="h-3 w-3 mr-1 text-yellow-600" />
        Draft for {daysSince} days
      </div>
      <div className="text-xs text-gray-500 mt-1">{item.author}</div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center p-4 hover:bg-[#FA8630]/5 rounded-lg transition-colors border border-gray-200 hover:border-[#FA8630] text-center"
    >
      <div className="p-3 rounded-full bg-[#FA8630]/10 text-[#FA8630] mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
};

export default CampaignDashboard;
