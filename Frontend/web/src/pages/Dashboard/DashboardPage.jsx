import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../utils/api-enhanced';
import { useAuth } from '../../hooks/useAuth';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Use the main dashboard endpoint instead of /stats
      const response = await dashboardAPI.getStats();
      
      // Check if response has the full data structure
      const data = response.data.data || response.data;
      
      console.log('Dashboard data received:', data);
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl font-bold mb-4">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchDashboardData();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Add safety check for stats
  if (!stats || !stats.incidents) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Loading dashboard data...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const { incidents, patrols, staff, verification, recentIncidents, todaysPatrols, activityTrends } = stats;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                autoRefresh
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {autoRefresh ? '✓ Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Refresh Now
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Pending Verification"
          value={verification.pending_verification}
          subtitle={`${verification.urgent_verifications} urgent`}
          icon={ExclamationTriangleIcon}
          color="yellow"
          trend={verification.overdue_verifications > 0 ? `${verification.overdue_verifications} overdue` : null}
        />
        <MetricCard
          title="Active Incidents"
          value={incidents.in_progress}
          subtitle={`${incidents.verified} verified`}
          icon={ClockIcon}
          color="blue"
        />
        <MetricCard
          title="Resolved Today"
          value={incidents.resolved}
          subtitle="Total resolved"
          icon={CheckCircleIcon}
          color="green"
        />
        <MetricCard
          title="Available Staff"
          value={staff.available}
          subtitle={`${staff.on_patrol} on patrol`}
          icon={UserGroupIcon}
          color="indigo"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Incident Statistics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Total Incidents" value={incidents.total_incidents} />
            <StatItem label="Bite Incidents" value={incidents.bite_incidents} color="red" />
            <StatItem label="Stray Reports" value={incidents.stray_incidents} color="blue" />
            <StatItem label="Resolved" value={incidents.resolved} color="green" />
            <StatItem label="Urgent Priority" value={incidents.urgent} color="orange" />
            <StatItem label="High Priority" value={incidents.high_priority} color="yellow" />
            <StatItem label="Verified" value={incidents.verified} color="blue" />
            <StatItem label="Rejected" value={incidents.rejected} color="gray" />
          </div>
        </div>

        {/* Patrol Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patrol Status</h2>
          <div className="space-y-4">
            <StatItem label="Scheduled" value={patrols.scheduled} color="blue" />
            <StatItem label="In Progress" value={patrols.in_progress} color="yellow" />
            <StatItem label="Completed" value={patrols.completed} color="green" />
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Outcomes:</p>
              <StatItem label="Captured" value={patrols.captured} color="green" size="sm" />
              <StatItem label="Not Found" value={patrols.not_found} color="gray" size="sm" />
              <StatItem label="Rescheduled" value={patrols.rescheduled} color="orange" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
          <div className="space-y-3">
            {recentIncidents && recentIncidents.length > 0 ? (
              recentIncidents.map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent incidents</p>
            )}
          </div>
        </div>

        {/* Today's Patrols */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Patrols</h2>
          <div className="space-y-3">
            {todaysPatrols && todaysPatrols.length > 0 ? (
              todaysPatrols.map((patrol) => (
                <PatrolItem key={patrol.id} patrol={patrol} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No patrols scheduled today</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Trends */}
      {activityTrends && activityTrends.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends (Last 7 Days)</h2>
          <div className="space-y-2">
            {activityTrends.map((trend) => (
              <div key={trend.date} className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">
                  {new Date(trend.date).toLocaleDateString()}
                </span>
                <div className="flex space-x-4">
                  <span className="text-sm">
                    <span className="font-medium">{trend.incident_count}</span> reported
                  </span>
                  <span className="text-sm text-green-600">
                    <span className="font-medium">{trend.resolved_count}</span> resolved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, subtitle, color, trend, icon: IconComponent }) => {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          {trend && <p className="text-xs text-red-600 mt-1">{trend}</p>}
        </div>
        {IconComponent && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color = 'gray', size = 'md' }) => {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';
  const colorClasses = {
    gray: 'text-gray-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
  };
  
  return (
    <div className="flex justify-between items-center">
      <span className={`${textSize} text-gray-600`}>{label}</span>
      <span className={`${textSize} font-semibold ${colorClasses[color] || colorClasses.gray}`}>{value}</span>
    </div>
  );
};

const IncidentItem = ({ incident }) => {
  const statusColors = {
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const priorityColors = {
    urgent: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-gray-600',
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
      <MapPinIcon className={`w-5 h-5 mt-1 ${priorityColors[incident.priority]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{incident.title}</p>
        <p className="text-xs text-gray-500">{incident.location}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[incident.status]}`}>
            {incident.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(incident.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const PatrolItem = ({ patrol }) => {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <ClockIcon className="w-5 h-5 mt-1 text-gray-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{patrol.incident_title}</p>
        <p className="text-xs text-gray-500">
          {patrol.first_name} {patrol.last_name} • {patrol.scheduled_time}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[patrol.status]} inline-block mt-1`}>
          {patrol.status}
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
