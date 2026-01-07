import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/CampaignManagement/Drawer";
import {
  ChartBarIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon as HeroEyeIcon,
  TagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Sample data for Announcement Management
  const dashboardData = {
    totalAnnouncements: 68,
    activeAnnouncements: 15,
    draftAnnouncements: 8,
    expiredAnnouncements: 22,
    pendingApprovals: 3,
    totalViews: 1245,
    engagementRate: "68%",
    scheduledAnnouncements: 7,
  };

  const recentActivities = [
    {
      id: 1,
      action: "New announcement published",
      time: "2 hours ago",
      icon: <MegaphoneIcon className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 2,
      action: "Announcement approved by admin",
      time: "5 hours ago",
      icon: <CheckBadgeIcon className="h-4 w-4 text-green-500" />,
    },
    {
      id: 3,
      action: "3 announcements scheduled",
      time: "1 day ago",
      icon: <CalendarIcon className="h-4 w-4 text-purple-500" />,
    },
    {
      id: 4,
      action: "High engagement on vaccination guidelines",
      time: "1 day ago",
      icon: <HeroEyeIcon className="h-4 w-4 text-[#FA8630]" />,
    },
  ];

  const announcementCategories = [
    {
      id: 1,
      name: "Health Advisory",
      count: 12,
      color: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      name: "Policy Update",
      count: 8,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: 3,
      name: "Event",
      count: 15,
      color: "bg-green-100 text-green-800",
    },
    {
      id: 4,
      name: "Important Notice",
      count: 5,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 5,
      name: "General Information",
      count: 28,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: "New Vaccination Guidelines for Pets",
      category: "Health Advisory",
      publishedDate: "2023-06-15",
      views: 245,
      status: "Active",
      priority: "High",
    },
    {
      id: 2,
      title: "Upcoming Pet Adoption Event - City Park",
      category: "Event",
      publishedDate: "2023-06-14",
      views: 189,
      status: "Active",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Important: Changes to Licensing Requirements",
      category: "Policy Update",
      publishedDate: "2023-06-12",
      views: 312,
      status: "Active",
      priority: "High",
    },
    {
      id: 4,
      title: "Summer Pet Care Tips",
      category: "General Information",
      publishedDate: "2023-06-10",
      views: 156,
      status: "Expired",
      priority: "Low",
    },
  ];

  const announcementStats = [
    {
      id: 1,
      period: "Last 24 Hours",
      views: 124,
      engagements: 85,
      newAnnouncements: 2,
    },
    {
      id: 2,
      period: "Last 7 Days",
      views: 845,
      engagements: 567,
      newAnnouncements: 8,
    },
    {
      id: 3,
      period: "Last 30 Days",
      views: 3245,
      engagements: 2206,
      newAnnouncements: 24,
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
              Announcement Management
            </h1>
            <button className="bg-[#FA8630] hover:bg-[#E87928] text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Announcement
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<MegaphoneIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Total Announcements"
              value={dashboardData.totalAnnouncements}
              trend="up"
              change="+12% from last month"
            />

            <MetricCard
              icon={<HeroEyeIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Active Announcements"
              value={dashboardData.activeAnnouncements}
              trend="up"
              change="+3 this week"
            />

            <MetricCard
              icon={
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-[#FA8630]" />
              }
              title="Pending Approvals"
              value={dashboardData.pendingApprovals}
              trend="down"
              change="-2 from yesterday"
            />

            <MetricCard
              icon={<DocumentTextIcon className="h-6 w-6 text-[#FA8630]" />}
              title="Total Views"
              value={dashboardData.totalViews.toLocaleString()}
              trend="up"
              change="+45% from last week"
            />
          </div>

          {/* Announcement Statistics & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Announcement Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Announcement Performance
                </h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              <div className="space-y-4">
                {announcementStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {stat.period}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <HeroEyeIcon className="h-4 w-4 mr-1" />
                          {stat.views} views
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {stat.engagements} engagements
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PlusIcon className="h-4 w-4 mr-1" />
                          {stat.newAnnouncements} new
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#FA8630]">
                        {Math.round((stat.engagements / stat.views) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Engagement rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcement Categories */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Announcement Categories
              </h2>
              <div className="space-y-3">
                {announcementCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-800">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                        {category.count}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
                      >
                        {Math.round(
                          (category.count / dashboardData.totalAnnouncements) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Announcements & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Announcements */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Announcements
                </h2>
                <button className="text-sm text-[#FA8630] hover:text-[#E87928]">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-3 rounded-lg hover:bg-[#FA8630]/5 transition-colors border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              announcement.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : announcement.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            } mr-2`}
                          >
                            {announcement.priority} Priority
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {announcement.category}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.status === "Active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {announcement.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(
                          announcement.publishedDate
                        ).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        <HeroEyeIcon className="h-4 w-4 mr-1" />
                        {announcement.views} views
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs text-[#FA8630] hover:text-[#E87928]">
                          Edit
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Drafts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions & Drafts
              </h2>
              <div className="space-y-4 mb-6">
                <ActionButton
                  icon={<PlusIcon className="h-5 w-5" />}
                  title="Create New Announcement"
                  description="Draft a new public notice"
                  onClick={() => console.log("Create announcement")}
                />
                <ActionButton
                  icon={<CalendarIcon className="h-5 w-5" />}
                  title="Schedule Announcement"
                  description="Plan future publication"
                  onClick={() => console.log("Schedule announcement")}
                />
                <ActionButton
                  icon={<ArchiveBoxIcon className="h-5 w-5" />}
                  title="Manage Drafts"
                  description={`${dashboardData.draftAnnouncements} drafts available`}
                  onClick={() => console.log("Manage drafts")}
                />
                <ActionButton
                  icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                  title="Urgent Announcements"
                  description="High priority notices"
                  onClick={() => console.log("Urgent announcements")}
                />
              </div>

              {/* Stats Summary */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {dashboardData.scheduledAnnouncements}
                    </div>
                    <div className="text-xs text-gray-600">Scheduled</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">
                      {dashboardData.draftAnnouncements}
                    </div>
                    <div className="text-xs text-gray-600">Drafts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {dashboardData.activeAnnouncements}
                    </div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">
                      {dashboardData.expiredAnnouncements}
                    </div>
                    <div className="text-xs text-gray-600">Expired</div>
                  </div>
                </div>
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
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">{icon}</div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
        <div
          className={`text-xs flex items-center ${
            trend === "up" ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpIcon className="h-3 w-3 mr-0.5" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 mr-0.5" />
          )}
          {change}
        </div>
      </div>
    </div>
  );
};

// Component for action buttons
const ActionButton = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-3 hover:bg-[#FA8630]/5 rounded-lg transition-colors border border-gray-200"
    >
      <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">{icon}</div>
      <div className="text-left flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowUpIcon className="h-4 w-4 text-gray-400 transform rotate-45" />
    </button>
  );
};

export default Dashboard;
