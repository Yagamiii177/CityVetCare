import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BuildingOffice2Icon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  MapPinIcon,
  BellIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/clinic_registration/drawer";
import { MetricsCard } from "../../components/Dashboard/MetricsCard";
import { ApprovalCenter } from "../../components/Dashboard/ApprovalCenter";
import { ActivityLog } from "../../components/Dashboard/ActivityLog";
import { AnalyticsCharts } from "../../components/Dashboard/AnalyticsCharts";
import { AlertsPanel } from "../../components/Dashboard/AlertsPanel";
import { MiniClinicMap } from "../../components/Dashboard/MiniClinicMap";
import { apiService } from "../../utils/api";

/**
 * AdminDashboard - Main admin dashboard for clinic management
 *
 * Features:
 * - Key metrics overview
 * - Pending approvals management
 * - Real-time clinic map
 * - Activity logs
 * - Analytics & trends
 * - System alerts
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Dashboard data state
  const [metrics, setMetrics] = useState({
    totalClinics: 0,
    pendingApprovals: 0,
    approvedClinics: 0,
    rejectedClinics: 0,
    inactiveClinics: 0,
  });

  const [pendingClinics, setPendingClinics] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [clinicLocations, setClinicLocations] = useState([]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch clinic statistics from admin dashboard endpoint
      const statsResponse = await apiService.adminDashboard.getStats();
      const stats = statsResponse.data.data || statsResponse.data;

      setMetrics({
        totalClinics: stats.total || 0,
        pendingApprovals: stats.pending || 0,
        approvedClinics: stats.active || 0,
        rejectedClinics: stats.rejected || 0,
        inactiveClinics: stats.inactive || 0,
      });

      // Fetch pending clinics for approval center
      const pendingResponse = await apiService.adminDashboard.getPendingClinics(
        {
          limit: 10,
        }
      );
      setPendingClinics(pendingResponse.data.data || pendingResponse.data);

      // Fetch recent activity
      const activityResponse = await apiService.adminDashboard.getActivity({
        limit: 20,
      });
      setRecentActivity(activityResponse.data.data || activityResponse.data);

      // Fetch analytics data
      const analyticsResponse = await apiService.adminDashboard.getAnalytics();
      setAnalyticsData(analyticsResponse.data.data || analyticsResponse.data);

      // Fetch alerts
      const alertsResponse = await apiService.adminDashboard.getAlerts();
      setAlerts(alertsResponse.data.data || alertsResponse.data);

      // Fetch clinic locations for map
      const locationsResponse = await apiService.clinics.getLocations({
        status: "all",
      });
      setClinicLocations(locationsResponse.data);

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    fetchDashboardData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchDashboardData();
  };

  /**
   * Handle quick navigation
   */
  const navigateToPending = () => navigate("/clinic-registration/pending");
  const navigateToClinicList = () => navigate("/clinic-registration/list");
  const navigateToMap = () => navigate("/clinic-registration/map");
  const navigateToAnalytics = () => navigate("/clinic-registration/analytics");

  if (loading && !metrics.totalClinics) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-[#FA8630] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
      <Drawer
        isOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-8 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Clinic Registration & Management System Overview
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {autoRefresh ? "🔄 Auto-refresh ON" : "⏸️ Auto-refresh OFF"}
              </button>

              {/* Manual refresh */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-xs text-red-700 hover:text-red-900 underline mt-1"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* 1️⃣ KEY METRICS - Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricsCard
              title="Total Clinics"
              value={metrics.totalClinics}
              icon={BuildingOffice2Icon}
              color="blue"
              onClick={navigateToClinicList}
            />
            <MetricsCard
              title="Pending Approvals"
              value={metrics.pendingApprovals}
              icon={ClockIcon}
              color="amber"
              urgent={metrics.pendingApprovals > 0}
              onClick={navigateToPending}
            />
            <MetricsCard
              title="Approved Clinics"
              value={metrics.approvedClinics}
              icon={CheckCircleIcon}
              color="green"
              onClick={navigateToClinicList}
            />
            <MetricsCard
              title="Rejected"
              value={metrics.rejectedClinics}
              icon={XCircleIcon}
              color="red"
              onClick={navigateToClinicList}
            />
            <MetricsCard
              title="Inactive"
              value={metrics.inactiveClinics}
              icon={XCircleIcon}
              color="gray"
              onClick={navigateToClinicList}
            />
          </div>

          {/* 6️⃣ ALERTS & NOTIFICATIONS - High Priority */}
          {alerts.length > 0 && (
            <AlertsPanel alerts={alerts} onRefresh={fetchDashboardData} />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* 2️⃣ APPROVAL & ACTION CENTER */}
              <ApprovalCenter
                pendingClinics={pendingClinics}
                onApprove={fetchDashboardData}
                onReject={fetchDashboardData}
                onViewAll={navigateToPending}
              />

              {/* 5️⃣ ANALYTICS & TRENDS */}
              <AnalyticsCharts
                data={analyticsData}
                onViewDetails={navigateToAnalytics}
              />

              {/* 4️⃣ ACTIVITY & SYSTEM LOGS */}
              <ActivityLog activities={recentActivity} loading={loading} />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* 3️⃣ SMART CLINIC MAP OVERVIEW */}
              <MiniClinicMap
                clinics={clinicLocations}
                onViewFullMap={navigateToMap}
              />

              {/* 7️⃣ ADMIN QUICK ACTIONS */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-[#FA8630]" />
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={navigateToPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors text-left"
                  >
                    <ClockIcon className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        Review Pending Clinics
                      </div>
                      <div className="text-xs text-gray-600">
                        {metrics.pendingApprovals} awaiting approval
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={navigateToClinicList}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
                  >
                    <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        View Clinic List
                      </div>
                      <div className="text-xs text-gray-600">
                        Manage all {metrics.totalClinics} clinics
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={navigateToMap}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-left"
                  >
                    <MapPinIcon className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        Open Smart Clinic Map
                      </div>
                      <div className="text-xs text-gray-600">
                        View geographic distribution
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={navigateToAnalytics}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-left"
                  >
                    <ChartBarIcon className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        View Statistics & Logs
                      </div>
                      <div className="text-xs text-gray-600">
                        Analytics and reports
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  System Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database</span>
                    <span className="text-green-600 font-semibold">
                      ● Online
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Service</span>
                    <span className="text-green-600 font-semibold">
                      ● Online
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-800 font-medium">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
