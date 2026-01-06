import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { apiService } from "../../utils/api";
import {
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

const AnimalCatcherSchedule = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Data state
  const [approvedIncidents, setApprovedIncidents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [patrolStaff, setPatrolStaff] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    assigned_staff_ids: [],
    incident_id: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  });
  
  const [showForm, setShowForm] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch incidents with status: verified, and patrol schedules, staff
      const [incidentsRes, schedulesRes, staffRes] = await Promise.all([
        apiService.incidents.getAll({ status: 'verified' }),
        apiService.patrolSchedules.getAll(),
        apiService.patrolStaff.getAll({ status: 'active' }),
      ]);

      setApprovedIncidents(incidentsRes.data.records || []);
      setSchedules(schedulesRes.data.records || []);
      setPatrolStaff(staffRes.data.records || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'select-multiple') {
      // Handle multi-select for staff
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOptions,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate form
      if (formData.assigned_staff_ids.length === 0 || !formData.incident_id || !formData.scheduled_date || !formData.scheduled_time) {
        setError("Please fill in all required fields and select at least one staff member");
        setLoading(false);
        return;
      }

      // Get staff names from selected IDs
      const selectedStaff = patrolStaff.filter(staff => 
        formData.assigned_staff_ids.includes(staff.id.toString())
      );
      const staffNames = selectedStaff.map(staff => staff.team_name || staff.leader_name).join(', ');

      // Create schedule with staff names
      const scheduleData = {
        assigned_staff_ids: formData.assigned_staff_ids.join(','),
        assigned_staff_names: staffNames,
        incident_id: formData.incident_id,
        schedule_date: `${formData.scheduled_date} ${formData.scheduled_time}:00`,
        status: "scheduled",
        notes: formData.notes,
      };

      await apiService.patrolSchedules.create(scheduleData);

      // Fetch complete incident data before updating
      const incidentResponse = await apiService.incidents.getById(formData.incident_id);
      const incident = incidentResponse.data.data || incidentResponse.data; // Handle both old and new response format

      // Update incident status to 'verified' (scheduled in patrol_schedules) with all required fields
      await apiService.incidents.update(formData.incident_id, {
        title: incident.title,
        description: incident.description,
        location: incident.location,
        latitude: incident.latitude,
        longitude: incident.longitude,
        status: "verified",
        assigned_catcher_id: incident.assigned_catcher_id,
      });

      setSuccessMessage("Patrol schedule created successfully! Incident status updated to 'Verified'.");
      
      // Reset form
      setFormData({
        assigned_staff_ids: [],
        incident_id: "",
        scheduled_date: "",
        scheduled_time: "",
        notes: "",
      });
      setShowForm(false);

      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error("Error creating schedule:", err);
      setError(err.response?.data?.message || "Failed to create schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleStatus = async (scheduleId, newStatus, incidentId) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Find the schedule to get its full data
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // Update schedule status
      await apiService.patrolSchedules.update(scheduleId, {
        assigned_staff_ids: schedule.assigned_staff_ids,
        assigned_staff_names: schedule.assigned_staff_names,
        incident_id: schedule.incident_id,
        schedule_date: schedule.schedule_date,
        status: newStatus,
        notes: schedule.notes,
      });

      // Update incident status based on patrol status
      let incidentStatus = "";
      if (newStatus === "in_progress") {
        incidentStatus = "in_progress";
      } else if (newStatus === "completed") {
        incidentStatus = "resolved";
      }

      if (incidentStatus && incidentId) {
        // Fetch complete incident data before updating
        const incidentResponse = await apiService.incidents.getById(incidentId);
        const incident = incidentResponse.data.data || incidentResponse.data; // Handle both old and new response format
        
        await apiService.incidents.update(incidentId, {
          title: incident.title,
          description: incident.description,
          location: incident.location,
          latitude: incident.latitude,
          longitude: incident.longitude,
          status: incidentStatus,
          assigned_catcher_id: incident.assigned_catcher_id,
        });
      }

      setSuccessMessage(`Patrol status updated to ${newStatus}!`);
      
      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Patrol Schedule Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#FA8630] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E87928] transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              {showForm ? "Cancel" : "New Schedule"}
            </button>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">
                  <UserGroupIcon className="h-6 w-6 text-[#FA8630]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active Staff
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {patrolStaff.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Schedules
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {schedules.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 mr-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {schedules.filter(s => s.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Approved Incidents
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {approvedIncidents.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Create New Patrol Schedule
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staff Selection - Multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patrol Staff * (Hold Ctrl/Cmd to select multiple)
                    </label>
                    <select
                      name="assigned_staff_ids"
                      multiple
                      value={formData.assigned_staff_ids}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630] min-h-[120px]"
                      required
                    >
                      {patrolStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.team_name} (Leader: {staff.leader_name}) - {staff.contact_number}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.assigned_staff_ids.length} staff member(s) selected
                    </p>
                  </div>

                  {/* Incident Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved Incident *
                    </label>
                    <select
                      name="incident_id"
                      value={formData.incident_id}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630]"
                      required
                    >
                      <option value="">Select an incident</option>
                      {approvedIncidents.map((incident) => (
                        <option key={incident.id} value={incident.id}>
                          #{incident.id} - {incident.title} ({incident.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      name="scheduled_date"
                      value={formData.scheduled_date}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630]"
                      required
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      name="scheduled_time"
                      value={formData.scheduled_time}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630]"
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630]"
                    placeholder="Add any special instructions or notes..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        assigned_staff_ids: [],
                        incident_id: "",
                        scheduled_date: "",
                        scheduled_time: "",
                        notes: "",
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    {loading ? "Creating..." : "Create Schedule"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Schedules Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Active Patrol Schedules
              </h2>
            </div>

            {loading && schedules.length === 0 ? (
              <div className="p-8 text-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-[#FA8630] mx-auto mb-2" />
                <p className="text-gray-600">Loading schedules...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No patrol schedules yet</p>
                <p className="text-sm text-gray-500">
                  Click "New Schedule" to create your first patrol schedule
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                        Incident
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                        Assigned Staff
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                        Schedule
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              #{schedule.incident_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {schedule.incident_title || "No title"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-800">
                            {schedule.assigned_staff_names || "No staff assigned"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4" />
                            {schedule.incident_location || "N/A"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <div>
                              {schedule.schedule_date ? new Date(schedule.schedule_date).toLocaleString() : "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              schedule.status
                            )}`}
                          >
                            {schedule.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {schedule.status === "scheduled" && (
                              <button
                                onClick={() =>
                                  updateScheduleStatus(
                                    schedule.id,
                                    "in_progress",
                                    schedule.incident_id
                                  )
                                }
                                disabled={loading}
                                className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-400"
                              >
                                Start Patrol
                              </button>
                            )}
                            {schedule.status === "in_progress" && (
                              <button
                                onClick={() =>
                                  updateScheduleStatus(
                                    schedule.id,
                                    "completed",
                                    schedule.incident_id
                                  )
                                }
                                disabled={loading}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
                              >
                                Complete
                              </button>
                            )}
                            {schedule.status === "completed" && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Finished
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {approvedIncidents.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ExclamationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {approvedIncidents.length} incident(s) waiting to be scheduled
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    These incidents have been approved and need patrol assignment
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnimalCatcherSchedule;