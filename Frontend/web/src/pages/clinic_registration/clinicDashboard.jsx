import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/clinic_registration/drawer";
import { MiniClinicMap } from "../../components/Dashboard/MiniClinicMap";
import { apiService } from "../../utils/api";
import {
  MapPinIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  StopIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
    <div
      className="h-12 w-12 flex items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });
  const [clinicLocations, setClinicLocations] = useState([]);
  const [pendingClinics, setPendingClinics] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allResp, locationsResp] = await Promise.all([
        apiService.clinics.getAll({ status: "all" }),
        apiService.clinics.getLocations({ status: "all" }),
      ]);

      const allClinics = allResp.data || [];
      const locations = (locationsResp.data || []).filter(
        (c) => c.status !== "Suspended"
      );

      setClinicLocations(locations);
      setPendingClinics(allClinics.filter((c) => c.status === "Pending"));

      setStats({
        total: allClinics.length,
        pending: allClinics.filter((c) => c.status === "Pending").length,
        active: allClinics.filter((c) => c.status === "Active").length,
        inactive: allClinics.filter((c) => c.status === "Inactive").length,
        suspended: allClinics.filter((c) => c.status === "Suspended").length,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load clinic data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topPending = pendingClinics.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={toggleDrawer} />
      <Drawer isOpen={isDrawerOpen} onClose={toggleDrawer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>Clinic Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#FA8630] font-medium">Dashboard</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Clinic Operations Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live clinic counts, pending approvals, and map overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300"
            >
              <ArrowPathIcon className="h-5 w-5 text-[#FA8630]" />
              Refresh
            </button>
            <button
              onClick={() => navigate("/clinic-map")}
              className="flex items-center gap-2 px-4 py-2 bg-[#FA8630] text-white rounded-lg text-sm font-medium hover:bg-[#e67c29] shadow-sm"
            >
              <MapPinIcon className="h-5 w-5" />
              Open Clinic Map
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <div className="flex-1">{error}</div>
            <button
              onClick={fetchData}
              className="text-red-700 font-semibold hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-5 mb-6">
          <StatCard
            title="Pending Approvals"
            value={loading ? "--" : stats.pending}
            icon={<ClockIcon className="h-6 w-6" />}
            color="#f59e0b"
          />
          <StatCard
            title="Active Clinics"
            value={loading ? "--" : stats.active}
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="#16a34a"
          />
          <StatCard
            title="Inactive"
            value={loading ? "--" : stats.inactive}
            icon={<BuildingOffice2Icon className="h-6 w-6" />}
            color="#3b82f6"
          />
          <StatCard
            title="Suspended"
            value={loading ? "--" : stats.suspended}
            icon={<StopIcon className="h-6 w-6" />}
            color="#ef4444"
          />
          <StatCard
            title="Total Clinics"
            value={loading ? "--" : stats.total}
            icon={<ChartBarIcon className="h-6 w-6" />}
            color="#0ea5e9"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-[#FA8630]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Clinic Map Overview
                  </h2>
                  <p className="text-sm text-gray-500">
                    Suspended clinics stay hidden
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/clinic-map")}
                className="text-sm text-[#FA8630] font-medium hover:text-[#e67c29]"
              >
                View Full Map
              </button>
            </div>
            <div className="h-[340px] overflow-hidden rounded-xl border border-gray-100">
              <MiniClinicMap
                clinics={clinicLocations}
                onViewFullMap={() => navigate("/clinic-map")}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BuildingOffice2Icon className="h-5 w-5 text-[#FA8630]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pending Clinics
                  </h2>
                  <p className="text-sm text-gray-500">
                    First five awaiting approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/clinic-list?tab=pending")}
                className="text-sm text-[#FA8630] font-medium hover:text-[#e67c29]"
              >
                Review All
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-gray-500">Loading clinics...</div>
              ) : topPending.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No pending clinics right now.
                </div>
              ) : (
                topPending.map((clinic) => (
                  <div
                    key={clinic._id || clinic.id}
                    className="p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {clinic.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {clinic.barangay || clinic.address}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          {clinic.contact && (
                            <span className="flex items-center gap-1">
                              <PhoneIcon className="h-4 w-4" />
                              {clinic.contact}
                            </span>
                          )}
                          {clinic.email && (
                            <span className="flex items-center gap-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              {clinic.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold">
                        Pending
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-[#FA8630]" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Next Actions
                </h2>
                <p className="text-sm text-gray-500">
                  Keep clinic data fresh and compliant
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-100 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">
                Review pending approvals
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Validate documents and activate clinics.
              </p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">
                Check suspended clinics
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Confirm issues resolved before reactivation.
              </p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">
                Verify map markers
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ensure coordinates and contact details are accurate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
