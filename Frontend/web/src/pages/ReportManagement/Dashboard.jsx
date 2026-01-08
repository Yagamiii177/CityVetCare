import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { apiService } from "../../utils/api";
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
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
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
  AreaChart,
  Area,
} from "recharts";

const IncidentDashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    reportsThisWeek: 0,
    scheduledPatrols: 0,
    inProgressReports: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Colors for charts
  const COLORS = ['#FA8630', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  // Status color mapping (requirement: Blue for Pending Verification, Green for Resolved)
  const STATUS_COLORS = {
    'Pending Verification': '#3B82F6', // Blue
    'Pending': '#3B82F6', // Blue
    'Verified': '#8B5CF6', // Purple
    'Scheduled': '#F59E0B', // Amber
    'In Progress': '#FA8630', // Orange
    'Resolved': '#10B981', // Green
    'Rejected': '#EF4444', // Red
    'Cancelled': '#6B7280', // Gray
  };
  
  // Function to get color by status name
  const getStatusColor = (statusName) => {
    return STATUS_COLORS[statusName] || '#6B7280'; // Default gray
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashResponse, incidentsResponse, schedulesResponse] = await Promise.all([
          apiService.dashboard.getStats(),
          apiService.incidents.getAll(),
          apiService.patrolSchedules.getAll(),
        ]);
        
        if (dashResponse.data) {
          // Handle both old and new API response formats
          const apiData = dashResponse.data.data || dashResponse.data;
          const summary = apiData.summary || {};
          const incidents = apiData.incidents || {};
          const patrols = apiData.patrols || {};
          
          // Count scheduled patrols from patrol_schedule table (status = 'Assigned' or 'Scheduled')
          const scheduledCount = patrols.scheduled || 
            schedulesResponse.data?.records?.filter(s => 
              s.status === 'Assigned' || s.status === 'Scheduled'
            ).length || 0;
          
          // Calculate pending verification count from actual incidents
          const allIncidents = incidentsResponse.data?.records || [];
          const pendingCount = allIncidents.filter(incident => {
            const status = incident.status?.toLowerCase();
            return status === 'pending' || status === 'pending_verification';
          }).length;
          
          setDashboardData({
            totalReports: incidents.total_incidents || summary.total_incidents || 0,
            resolvedReports: incidents.resolved || summary.resolved_incidents || 0,
            // Use calculated pending count from actual data
            pendingReports: pendingCount,
            reportsThisWeek: incidents.in_progress || summary.in_progress_incidents || 0,
            scheduledPatrols: scheduledCount,
            inProgressReports: incidents.in_progress || summary.in_progress_incidents || 0,
          });
          
          // Transform recent incidents
          const recentIncidentsData = apiData.recentIncidents || apiData.recent_incidents || [];
          if (recentIncidentsData.length > 0) {
            const transformed = recentIncidentsData.map(incident => ({
              id: incident.id || incident.report_id,
              action: incident.title || incident.report_type || 'Incident',
              time: new Date(incident.created_at || incident.reported_at).toLocaleDateString(),
              status: incident.status,
              icon: <PlusIcon className="h-4 w-4 text-[#FA8630]" />,
            }));
            setRecentIncidents(transformed);
          }
        }

        // Process all incidents for analytics
        if (incidentsResponse.data?.records) {
          const incidents = incidentsResponse.data.records;
          setAllIncidents(incidents);

          // Generate monthly trend data (last 6 months)
          const monthlyData = generateMonthlyTrend(incidents);
          setMonthlyTrend(monthlyData);

          // Generate category distribution
          const categories = generateCategoryData(incidents);
          setCategoryData(categories);

          // Generate status distribution
          const statuses = generateStatusData(incidents);
          setStatusData(statuses);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Generate monthly trend for last 6 months
  const generateMonthlyTrend = (incidents) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthIncidents = incidents.filter(inc => {
        const incDate = new Date(inc.created_at);
        return incDate.getMonth() === date.getMonth() && 
               incDate.getFullYear() === date.getFullYear();
      });

      months.push({
        name: monthName,
        reports: monthIncidents.length,
        resolved: monthIncidents.filter(i => i.status?.toLowerCase() === 'resolved').length,
        pending: monthIncidents.filter(i => ['pending', 'pending_verification'].includes(i.status?.toLowerCase())).length,
      });
    }
    
    return months;
  };

  // Generate category distribution by incident type
  const generateCategoryData = (incidents) => {
    const categories = {
      'Bite Incident': 0,
      'Stray Animal': 0,
      'Other': 0
    };
    
    incidents.forEach(inc => {
      // Use report_type field from backend (bite, stray, lost)
      const type = (inc.report_type || inc.incident_type || '').toLowerCase();
      
      if (type === 'bite' || type.includes('bite')) {
        categories['Bite Incident']++;
      } else if (type === 'stray' || type.includes('stray')) {
        categories['Stray Animal']++;
      } else {
        categories['Other']++;
      }
    });

    // Only return categories with values > 0 to avoid "Other = 100%" issue
    return Object.entries(categories)
      .filter(([name, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
      }));
  };

  // Generate status distribution
  const generateStatusData = (incidents) => {
    const statuses = {};
    
    incidents.forEach(inc => {
      let status = inc.status || 'Pending';
      
      // Normalize status names for consistency
      if (status.toLowerCase() === 'pending' || status.toLowerCase() === 'pending_verification') {
        status = 'Pending Verification';
      } else if (status.toLowerCase() === 'in progress' || status.toLowerCase() === 'in_progress') {
        status = 'In Progress';
      } else {
        // Normalize to Title Case
        status = status.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      
      statuses[status] = (statuses[status] || 0) + 1;
    });

    return Object.entries(statuses).map(([name, value]) => ({
      name,
      value,
    }));
  };

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
              change={`${dashboardData.totalReports} total`}
              bgColor="bg-orange-50"
            />

            <MetricCard
              icon={
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600" />
              }
              title="Resolved Reports"
              value={dashboardData.resolvedReports}
              trend="up"
              change={`${((dashboardData.resolvedReports / dashboardData.totalReports) * 100 || 0).toFixed(1)}% completion`}
              bgColor="bg-green-50"
            />

            <MetricCard
              icon={<ClockIcon className="h-6 w-6 text-blue-600" />}
              title="Pending Verification"
              value={dashboardData.pendingReports}
              trend="neutral"
              change="Awaiting review"
              bgColor="bg-blue-50"
            />

            <MetricCard
              icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
              title="Scheduled Patrols"
              value={dashboardData.scheduledPatrols}
              trend="up"
              change="Active assignments"
              bgColor="bg-blue-50"
            />
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Monthly Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Monthly Incident Trend
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Last 6 months overview</p>
                </div>
                <ChartBarIcon className="h-6 w-6 text-[#FA8630]" />
              </div>

              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FA8630" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FA8630" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="reports" 
                        stroke="#FA8630" 
                        fillOpacity={1} 
                        fill="url(#colorReports)" 
                        name="Total Reports"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#colorResolved)" 
                        name="Resolved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Quick Insights
                </h2>
                <CalendarIcon className="h-5 w-5 text-[#FA8630]" />
              </div>

              <div className="space-y-4">
                <StatItem
                  icon={<PlusIcon className="h-5 w-5 text-[#FA8630]" />}
                  title="Today's Reports"
                  value={allIncidents.filter(i => {
                    const today = new Date();
                    const incDate = new Date(i.created_at);
                    return incDate.toDateString() === today.toDateString();
                  }).length}
                  description="New incidents today"
                  trend="up"
                />

                <StatItem
                  icon={<MapPinIcon className="h-5 w-5 text-blue-600" />}
                  title="In Progress"
                  value={dashboardData.inProgressReports}
                  description="Active field response"
                  trend="neutral"
                />

                <StatItem
                  icon={
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-600" />
                  }
                  title="Completion Rate"
                  value={`${((dashboardData.resolvedReports / dashboardData.totalReports) * 100 || 0).toFixed(0)}%`}
                  description="Overall success rate"
                  trend="up"
                />

                <StatItem
                  icon={<ClockIcon className="h-5 w-5 text-yellow-600" />}
                  title="This Week"
                  value={allIncidents.filter(i => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const incDate = new Date(i.created_at);
                    return incDate >= weekAgo;
                  }).length}
                  description="Reports this week"
                  trend="neutral"
                />
              </div>
            </div>
          </div>

          {/* Category and Status Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Incident Type Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Incident Type Distribution
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Breakdown by incident category</p>
                </div>
                <ExclamationTriangleIcon className="h-6 w-6 text-[#FA8630]" />
              </div>

              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={400}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Status Overview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Current incident states</p>
                </div>
                <CheckBadgeIcon className="h-6 w-6 text-green-600" />
              </div>

              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630]"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Activities
                </h2>
                <p className="text-sm text-gray-500 mt-1">Latest incident reports</p>
              </div>
              <button className="text-sm text-[#FA8630] hover:text-[#E87928] font-medium transition-colors">
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA8630] mx-auto"></div>
                </div>
              ) : recentIncidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activities</p>
                </div>
              ) : (
                recentIncidents.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center py-3 px-4 rounded-lg hover:bg-[#FA8630]/5 transition-colors border border-transparent hover:border-[#FA8630]/20"
                  >
                    <div className="p-2 rounded-full bg-[#FA8630]/10 mr-4">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status?.toLowerCase() === 'resolved' ? 'bg-green-100 text-green-800' :
                        activity.status?.toLowerCase() === 'in progress' || activity.status?.toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        activity.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Metric Card
const MetricCard = ({ icon, title, value, trend, change, bgColor = "bg-white" }) => (
  <div className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-3">
          <div className="p-3 rounded-lg bg-white shadow-sm mr-3">{icon}</div>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <div className="flex items-center">
          <span className={`text-xs font-medium ${
            trend === "up" ? "text-green-600" : 
            trend === "down" ? "text-red-600" : 
            "text-gray-600"
          }`}>
            {trend === "up" && <ArrowUpIcon className="h-3 w-3 inline mr-1" />}
            {trend === "down" && <ArrowDownIcon className="h-3 w-3 inline mr-1" />}
            {change}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Stat Item
const StatItem = ({ icon, title, value, description, trend }) => (
  <div className="flex items-center p-4 hover:bg-[#FA8630]/5 rounded-xl transition-colors border border-transparent hover:border-[#FA8630]/20">
    <div className="p-2.5 rounded-lg bg-white shadow-sm mr-4">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <div className="flex items-baseline justify-between mt-1">
        <div>
          <span className="text-xl font-bold text-gray-900 mr-2">
            {value}
          </span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
        {trend === "up" && (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        )}
        {trend === "down" && (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  </div>
);

export default IncidentDashboard;
