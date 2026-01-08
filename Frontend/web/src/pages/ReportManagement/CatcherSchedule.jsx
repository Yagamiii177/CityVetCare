import { useState, useEffect, useRef } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import MultiSelectCheckbox from "../../components/MultiSelectCheckbox";
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
  XMarkIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const AnimalCatcherSchedule = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);

  // Data state
  const [approvedIncidents, setApprovedIncidents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [patrolStaff, setPatrolStaff] = useState([]);

  // Filter states - UPDATED to match first component
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states for staff search
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [debouncedStaffSearchTerm, setDebouncedStaffSearchTerm] = useState("");

  // Refs for debounce cleanup
  const debounceTimerRef = useRef(null);
  const staffDebounceTimerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    assigned_staff_ids: [],
    incident_id: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // New states for "Add Dog Catcher" modal
  const [showAddCatcherModal, setShowAddCatcherModal] = useState(false);
  const [newCatcherData, setNewCatcherData] = useState({
    full_name: "",
    contact_number: "",
  });
  const [catcherFormErrors, setCatcherFormErrors] = useState({});

  // State for pending incidents count
  const [pendingIncidentsCount, setPendingIncidentsCount] = useState(0);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Debounce search term with 300ms delay
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Debounce staff search term with 300ms delay
  useEffect(() => {
    if (staffDebounceTimerRef.current) {
      clearTimeout(staffDebounceTimerRef.current);
    }

    staffDebounceTimerRef.current = setTimeout(() => {
      setDebouncedStaffSearchTerm(staffSearchTerm);
    }, 300);

    return () => {
      if (staffDebounceTimerRef.current) {
        clearTimeout(staffDebounceTimerRef.current);
      }
    };
  }, [staffSearchTerm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (staffDebounceTimerRef.current) {
        clearTimeout(staffDebounceTimerRef.current);
      }
    };
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error || conflictWarning) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
        setConflictWarning(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, conflictWarning]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [incidentsRes, schedulesRes, staffRes] = await Promise.all([
        apiService.incidents.getAll({ status: "Verified" }),
        apiService.patrolSchedules.getAll(),
        apiService.patrolStaff.getAll({ status: "active" }),
      ]);

      setApprovedIncidents(incidentsRes.data.records || []);
      setSchedules(schedulesRes.data.records || []);
      setPatrolStaff(staffRes.data.records || []);

      const approvedIncidents = incidentsRes.data.records || [];
      const existingSchedules = schedulesRes.data.records || [];
      const scheduledIncidentIds = new Set(
        existingSchedules.map((s) => s.incident_id)
      );
      const pendingCount = approvedIncidents.filter(
        (inc) => !scheduledIncidentIds.has(inc.id)
      ).length;
      setPendingIncidentsCount(pendingCount);

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    if (
      (name === "scheduled_date" || name === "scheduled_time") &&
      conflictWarning
    ) {
      setConflictWarning(null);
    }
  };

  // Handle multi-select staff change
  const handleStaffChange = (selectedIds) => {
    setFormData((prev) => ({
      ...prev,
      assigned_staff_ids: selectedIds,
    }));

    if (formErrors.assigned_staff_ids) {
      setFormErrors((prev) => ({
        ...prev,
        assigned_staff_ids: null,
      }));
    }

    if (conflictWarning) {
      setConflictWarning(null);
    }
  };

  // Check for conflicts in real-time
  const checkScheduleConflict = async () => {
    if (
      formData.assigned_staff_ids.length === 0 ||
      !formData.scheduled_date ||
      !formData.scheduled_time
    ) {
      return false;
    }

    try {
      const response = await apiService.patrolSchedules.checkConflict({
        staff_ids: formData.assigned_staff_ids.join(","),
        schedule_date: `${formData.scheduled_date} ${formData.scheduled_time}:00`,
        schedule_time: formData.scheduled_time,
      });

      if (response.data.has_conflict) {
        const conflictDetails = response.data.conflicts
          .map((c) => `${c.staff_name} is already scheduled`)
          .join(", ");
        setConflictWarning(conflictDetails);
        return true;
      } else {
        setConflictWarning(null);
        return false;
      }
    } catch (err) {
      console.error("Error checking conflicts:", err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setConflictWarning(null);
    setFormErrors({});

    try {
      // Validate form
      const errors = {};

      if (formData.assigned_staff_ids.length === 0) {
        errors.assigned_staff_ids =
          "Please select at least one patrol staff member";
      }

      if (!formData.incident_id) {
        errors.incident_id = "Please select an incident";
      }

      if (!formData.scheduled_date) {
        errors.scheduled_date = "Please select a date";
      }

      if (!formData.scheduled_time) {
        errors.scheduled_time = "Please select a time";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Check for schedule conflicts
      const hasConflict = await checkScheduleConflict();
      if (hasConflict) {
        setError(
          "Cannot create schedule: Time conflict detected. Please choose a different time or staff."
        );
        setLoading(false);
        return;
      }

      // Get staff names from selected IDs
      const selectedStaff = patrolStaff.filter((staff) =>
        formData.assigned_staff_ids.includes(staff.id.toString())
      );
      const staffNames = selectedStaff
        .map((staff) => staff.team_name || staff.leader_name)
        .join(", ");

      // Create schedule with staff names
      const scheduleData = {
        assigned_staff_ids: formData.assigned_staff_ids.join(","),
        assigned_staff_names: staffNames,
        incident_id: formData.incident_id,
        schedule_date: `${formData.scheduled_date} ${formData.scheduled_time}:00`,
        schedule_time: formData.scheduled_time,
        status: "Scheduled",
        notes: formData.notes,
      };

      await apiService.patrolSchedules.create(scheduleData);

      // Fetch complete incident data before updating
      const incidentResponse = await apiService.incidents.getById(
        formData.incident_id
      );
      const incident = incidentResponse.data.data || incidentResponse.data;

      // Update incident status to 'verified'
      await apiService.incidents.update(formData.incident_id, {
        title: incident.title,
        description: incident.description,
        location: incident.location,
        latitude: incident.latitude,
        longitude: incident.longitude,
        status: "Verified",
        assigned_catcher_id: incident.assigned_catcher_id,
      });

      setSuccessMessage(
        `✓ Patrol schedule created! One patrol group with ${formData.assigned_staff_ids.length} team member(s) assigned.`
      );

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
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create schedule";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleStatus = async (scheduleId, newStatus) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiService.patrolSchedules.update(scheduleId, {
        status: newStatus,
      });

      setSuccessMessage(
        `Patrol status updated to ${newStatus.replace("_", " ")}!`
      );

      await fetchAllData();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler for removing staff from patrol schedule
  const handleRemoveStaff = async (scheduleId, staffId) => {
    if (
      !confirm(
        "Are you sure you want to remove this staff member from the patrol schedule?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.patrolSchedules.removeStaff(scheduleId, staffId);
      setSuccessMessage(
        "Staff member removed from patrol schedule successfully!"
      );

      await fetchAllData();

      if (selectedSchedule && selectedSchedule.id === scheduleId) {
        const updatedSchedule = await apiService.patrolSchedules.getById(
          scheduleId
        );
        setSelectedSchedule(updatedSchedule.data.data);
      }
    } catch (err) {
      console.error("Error removing staff:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to remove staff member";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler for adding new dog catcher
  const handleAddCatcher = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCatcherFormErrors({});

    try {
      const errors = {};

      if (!newCatcherData.full_name || newCatcherData.full_name.trim() === "") {
        errors.full_name = "Full name is required";
      }

      if (
        !newCatcherData.contact_number ||
        newCatcherData.contact_number.trim() === ""
      ) {
        errors.contact_number = "Contact number is required";
      }

      if (Object.keys(errors).length > 0) {
        setCatcherFormErrors(errors);
        setLoading(false);
        return;
      }

      await apiService.patrolStaff.create({
        name: newCatcherData.full_name,
        team_name: newCatcherData.full_name,
        contact_number: newCatcherData.contact_number,
      });

      setSuccessMessage(
        `✓ Dog catcher "${newCatcherData.full_name}" added successfully!`
      );

      setNewCatcherData({ full_name: "", contact_number: "" });
      setShowAddCatcherModal(false);

      await fetchAllData();
    } catch (err) {
      console.error("Error adding dog catcher:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add dog catcher";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCatcherFormChange = (e) => {
    const { name, value } = e.target;

    setNewCatcherData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (catcherFormErrors[name]) {
      setCatcherFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Filter schedules with debounced search
  // Searches: schedule_id, incident_id, patrol_status, assigned_staff_name, scheduled_date
  const filteredSchedules = schedules.filter((schedule) => {
    // Apply debounced search filter (case-insensitive, partial matches)
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      schedule.id?.toString().includes(searchLower) || // schedule_id
      schedule.incident_id?.toString().includes(searchLower) || // incident_id
      schedule.status?.toLowerCase().includes(searchLower) || // patrol_status
      schedule.assigned_staff_names?.toLowerCase().includes(searchLower) || // assigned_staff_name
      schedule.incident_title?.toLowerCase().includes(searchLower) ||
      schedule.incident_location?.toLowerCase().includes(searchLower) ||
      (schedule.schedule_date &&
        new Date(schedule.schedule_date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchLower)); // scheduled_date

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" || schedule.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter staff with debounced search
  // Searches: staff_id, full_name, role, availability_status
  const filteredStaff = patrolStaff.filter((staff) => {
    const searchLower = debouncedStaffSearchTerm.toLowerCase().trim();
    return (
      searchLower === "" ||
      staff.id?.toString().includes(searchLower) || // staff_id
      staff.team_name?.toLowerCase().includes(searchLower) || // full_name
      staff.leader_name?.toLowerCase().includes(searchLower) || // full_name
      staff.contact_number?.toLowerCase().includes(searchLower) ||
      staff.status?.toLowerCase().includes(searchLower)
    ); // availability_status
  });

  // Get status badge - UPDATED to match first component style
  const getStatusBadge = (status) => {
    const styles = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };

    const normalizedStatus = String(status ?? "scheduled")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[normalizedStatus] || styles.scheduled
        }`}
      >
        {normalizedStatus.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  // Export schedules to CSV - NEW FUNCTION
  const handleExportCSV = () => {
    if (filteredSchedules.length === 0) {
      setSuccessMessage({
        isOpen: true,
        title: "No Data",
        message: "No schedules available to export",
        type: "warning",
      });
      return;
    }

    const headers = [
      "Schedule ID",
      "Incident ID",
      "Incident Title",
      "Assigned Staff",
      "Location",
      "Schedule Date",
      "Schedule Time",
      "Status",
      "Notes",
      "Created At",
    ];

    const rows = filteredSchedules.map((schedule) => [
      schedule.id,
      schedule.incident_id,
      schedule.incident_title || "N/A",
      schedule.assigned_staff_names || "Unassigned",
      schedule.incident_location || "N/A",
      schedule.schedule_date
        ? new Date(schedule.schedule_date).toLocaleDateString()
        : "N/A",
      schedule.schedule_date
        ? new Date(schedule.schedule_date).toLocaleTimeString()
        : schedule.schedule_time || "N/A",
      schedule.status,
      `"${(schedule.notes || "").replace(/"/g, '""')}"`,
      schedule.created_at
        ? new Date(schedule.created_at).toLocaleString()
        : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `patrol_schedules_${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage(
      `Exported ${filteredSchedules.length} schedules to CSV file`
    );
  };

  // Clear all filters - NEW FUNCTION
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setShowFilters(false);
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
        <div className="p-8 space-y-6">
          {/* PRIORITY: Incidents Waiting to Be Scheduled Banner - TOP OF PAGE */}
          {pendingIncidentsCount > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-lg p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-orange-500 shadow-md">
                  <ExclamationCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-orange-900 mb-1">
                    {pendingIncidentsCount} incident(s) waiting to be scheduled
                  </h3>
                  <p className="text-sm text-orange-800">
                    These incidents have been approved and need patrol
                    assignment.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-3 inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors shadow-md"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Patrol Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header with Search and Filters - UPDATED to match first component */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Patrol Schedule Management
              </h1>
              <p className="text-gray-600">
                Assign patrols and track their progress
              </p>
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    <button
                      onClick={fetchAllData}
                      className="text-xs text-red-700 hover:text-red-900 underline mt-1"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddCatcherModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Add new dog catcher"
              >
                <PlusIcon className="h-5 w-5" />
                Add Dog Catcher
              </button>
              <button
                className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#E87928] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowForm(!showForm)}
                disabled={loading}
                aria-label={
                  showForm ? "Cancel new schedule" : "Create new schedule"
                }
              >
                {showForm ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <PlusIcon className="h-5 w-5" />
                )}
                {showForm ? "Cancel" : "New Schedule"}
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              {successMessage}
            </div>
          )}

          {conflictWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5" />
              <div>
                <p className="font-semibold">Schedule Conflict Warning</p>
                <p className="text-sm mt-1">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && schedules.length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA8630] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading schedules...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Quick Stats - UPDATED to match first component style */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Active Staff */}
                <button
                  onClick={() => setShowAddCatcherModal(true)}
                  className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200 hover:border-green-600 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Staff
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {patrolStaff.length}
                      </p>
                    </div>
                    <UserGroupIcon className="h-4 w-4 text-green-600" />
                  </div>
                </button>

                {/* Total Schedules */}
                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Schedules
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {schedules.length}
                      </p>
                    </div>
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                {/* In Progress */}
                <button
                  onClick={() => setStatusFilter("in_progress")}
                  className={`bg-white p-4 rounded-lg shadow-sm border-2 transition-all text-left ${
                    statusFilter === "in_progress"
                      ? "border-[#FA8630] bg-[#FA8630]/5"
                      : "border-gray-200 hover:border-[#FA8630]/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        In Progress
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {
                          schedules.filter((s) => s.status === "in_progress")
                            .length
                        }
                      </p>
                    </div>
                    <ClockIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                </button>

                {/* Approved Incidents */}
                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Approved Incidents
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {approvedIncidents.length}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Search and Filters - UPDATED to match first component */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <label htmlFor="search-input" className="sr-only">
                      Search schedules
                    </label>
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search by schedule ID, incident ID, status, assigned staff, or date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      aria-label="Search schedules by schedule ID, incident ID, status, assigned staff, or date"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-3"
                        aria-label="Clear search"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                    {showFilters ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div
                    id="filter-panel"
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200"
                  >
                    {/* Status Filter */}
                    <div>
                      <label
                        htmlFor="status-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Status
                      </label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        aria-label="Filter by status"
                      >
                        <option value="all">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Info text */}
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Use the search bar to filter by
                        incident title, staff names, or location.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Form */}
              {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Create New Patrol Schedule
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Assign patrol staff to verified incidents
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setFormData({
                          assigned_staff_ids: [],
                          incident_id: "",
                          scheduled_date: "",
                          scheduled_time: "",
                          notes: "",
                        });
                        setFormErrors({});
                        setConflictWarning(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Staff Selection */}
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Step 1: Select Patrol Staff
                      </h3>

                      <MultiSelectCheckbox
                        label="Patrol Staff (Animal Catchers)"
                        placeholder="Click to select one or more animal catchers..."
                        required={true}
                        options={patrolStaff.map((staff) => ({
                          value: staff.id.toString(),
                          label:
                            staff.team_name ||
                            staff.leader_name ||
                            `Catcher ${staff.id}`,
                          sublabel: staff.contact_number || "No contact number",
                        }))}
                        selectedValues={formData.assigned_staff_ids}
                        onChange={handleStaffChange}
                        error={formErrors.assigned_staff_ids}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Click on staff members to select them. No keyboard
                        shortcuts required.
                      </p>
                    </div>

                    {/* Section 2: Incident Selection */}
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Step 2: Select Incident
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approved Incident{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="incident_id"
                          value={formData.incident_id}
                          onChange={handleFormChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-all ${
                            formErrors.incident_id
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                        >
                          <option value="">
                            -- Select an incident to schedule --
                          </option>
                          {approvedIncidents.map((incident) => (
                            <option key={incident.id} value={incident.id}>
                              #{incident.id} - {incident.title} (
                              {incident.location})
                            </option>
                          ))}
                        </select>
                        {formErrors.incident_id && (
                          <p className="text-xs text-red-500 mt-1.5 font-medium">
                            {formErrors.incident_id}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Schedule Date & Time */}
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Step 3: Set Date and Time
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date - Fully Clickable */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule Date{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              name="scheduled_date"
                              value={formData.scheduled_date}
                              onChange={handleFormChange}
                              onBlur={checkScheduleConflict}
                              min={new Date().toISOString().split("T")[0]}
                              className={`w-full px-4 py-3 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-all cursor-pointer ${
                                formErrors.scheduled_date
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              style={{ colorScheme: "light" }}
                              required
                            />
                          </div>
                          {formErrors.scheduled_date && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">
                              {formErrors.scheduled_date}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Click anywhere on the field to select a date
                          </p>
                        </div>

                        {/* Time - Fully Clickable, No Overlap */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule Time{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              name="scheduled_time"
                              value={formData.scheduled_time}
                              onChange={handleFormChange}
                              onBlur={checkScheduleConflict}
                              className={`w-full px-4 py-3 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-all cursor-pointer ${
                                formErrors.scheduled_time
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              style={{ colorScheme: "light" }}
                              required
                            />
                          </div>
                          {formErrors.scheduled_time && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">
                              {formErrors.scheduled_time}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Click anywhere on the field to select a time
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Notes (Optional) */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Step 4: Additional Notes (Optional)
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions or Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleFormChange}
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA8630] transition-all"
                          placeholder="Add any special instructions, safety considerations, or important details for the patrol team..."
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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
                          setFormErrors({});
                          setConflictWarning(null);
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || conflictWarning}
                        className="px-6 py-3 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                      >
                        {loading && (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        )}
                        {loading
                          ? "Creating Schedule..."
                          : "Create Patrol Schedule"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Schedules Table - UPDATED to match first component design */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Active Patrol Schedules ({filteredSchedules.length})
                  </h2>
                  <button
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={filteredSchedules.length === 0}
                    onClick={handleExportCSV}
                    aria-label="Export schedules"
                    title="Export schedules to CSV"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Export
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    role="table"
                    aria-label="Patrol schedules"
                  >
                    <caption className="sr-only">
                      List of patrol schedules with details and actions
                    </caption>
                    <thead className="bg-[#FA8630]/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Incident
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Assigned Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Schedule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filteredSchedules.length ? (
                        filteredSchedules.map((schedule) => (
                          <tr
                            key={schedule.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                #{schedule.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  #{schedule.incident_id}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {schedule.incident_title || "No title"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#FA8630]/10 flex items-center justify-center flex-shrink-0">
                                  <UserGroupIcon className="h-4 w-4 text-[#FA8630]" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {schedule.assigned_staff_names ||
                                      "Unassigned"}
                                  </p>
                                  {schedule.staff_count > 1 && (
                                    <p className="text-xs text-gray-500">
                                      {schedule.staff_count} team members
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-start gap-1.5">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p
                                  className="text-sm text-gray-900 max-w-xs truncate"
                                  title={schedule.incident_location}
                                >
                                  {schedule.incident_location ||
                                    "Location not specified"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {schedule.schedule_date
                                    ? new Date(
                                        schedule.schedule_date
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {schedule.schedule_date
                                    ? new Date(
                                        schedule.schedule_date
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : schedule.schedule_time || ""}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(schedule.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedSchedule(schedule);
                                    setShowViewModal(true);
                                  }}
                                  className="text-[#FA8630] hover:text-[#E87928] p-1 rounded hover:bg-[#FA8630]/10 transition-colors"
                                  title="View Details"
                                  aria-label={`View details for schedule ${schedule.id}`}
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                {schedule.status !== "in_progress" &&
                                  schedule.status !== "completed" && (
                                    <button
                                      onClick={() =>
                                        updateScheduleStatus(
                                          schedule.id,
                                          "in_progress"
                                        )
                                      }
                                      disabled={loading}
                                      className="px-3 py-1 text-xs font-medium bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                      Start
                                    </button>
                                  )}
                                {schedule.status === "in_progress" && (
                                  <button
                                    onClick={() =>
                                      updateScheduleStatus(
                                        schedule.id,
                                        "completed"
                                      )
                                    }
                                    disabled={loading}
                                    className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No schedules found matching your criteria</p>
                              <button
                                onClick={clearFilters}
                                className="text-[#FA8630] hover:text-[#E87928] mt-2 underline"
                              >
                                Clear all filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dog Catcher / Staff Management Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Dog Catcher / Staff Management ({filteredStaff.length})
                  </h2>
                </div>

                {/* Staff Search Bar */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <label htmlFor="staff-search-input" className="sr-only">
                      Search staff
                    </label>
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      id="staff-search-input"
                      type="text"
                      placeholder="Search by staff ID, name, contact number, or status..."
                      value={staffSearchTerm}
                      onChange={(e) => setStaffSearchTerm(e.target.value)}
                      className="pl-10 pr-10 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      aria-label="Search staff by ID, name, contact number, or status"
                    />
                    {staffSearchTerm && (
                      <button
                        onClick={() => setStaffSearchTerm("")}
                        className="absolute right-3 top-3"
                        aria-label="Clear staff search"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    role="table"
                    aria-label="Dog catcher staff"
                  >
                    <caption className="sr-only">
                      List of dog catcher staff with details
                    </caption>
                    <thead className="bg-[#FA8630]/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Staff ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Contact Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                          Availability Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filteredStaff.length ? (
                        filteredStaff.map((staff) => (
                          <tr
                            key={staff.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                #{staff.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">
                                {staff.team_name ||
                                  staff.leader_name ||
                                  `Staff ${staff.id}`}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                {staff.contact_number || "N/A"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                Animal Catcher
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  staff.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {staff.status
                                  ? staff.status.toUpperCase()
                                  : "ACTIVE"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>
                                No staff members found matching your criteria
                              </p>
                              {staffSearchTerm && (
                                <button
                                  onClick={() => setStaffSearchTerm("")}
                                  className="text-[#FA8630] hover:text-[#E87928] mt-2 underline"
                                >
                                  Clear search
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* View Details Modal */}
      {showViewModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl my-8 rounded-xl shadow-2xl relative">
            {/* Close Button - Fixed at top */}
            <button
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
              onClick={() => {
                setShowViewModal(false);
                setSelectedSchedule(null);
              }}
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5 text-gray-700" />
            </button>

            {/* Scrollable Content */}
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between pr-12">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Patrol Schedule Details
                      </h2>
                      <p className="text-gray-500">
                        Schedule ID: #{selectedSchedule.id}
                      </p>
                    </div>
                    <div>{getStatusBadge(selectedSchedule.status)}</div>
                  </div>
                </div>

                {/* Incident Information */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-blue-600" />
                    Incident Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Incident ID
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">
                          #{selectedSchedule.incident_id}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Incident Description
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-900">
                          {selectedSchedule.incident_title ||
                            selectedSchedule.incident_description ||
                            "No description available"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Location
                      </label>
                      <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <MapPinIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900">
                          {selectedSchedule.incident_location ||
                            "Location not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patrol Team Information */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-[#FA8630]" />
                    Assigned Patrol Team
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Team Members ({selectedSchedule.staff_count || 1})
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">
                          {selectedSchedule.assigned_staff_names ||
                            "Unassigned"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Staff IDs
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-mono text-sm">
                          {selectedSchedule.assigned_staff_ids ||
                            selectedSchedule.assigned_catcher_id ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Patrol Staff Details Table */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Assigned Patrol Staff Details
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Full Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Contact Number
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(() => {
                            const assignedStaff =
                              selectedSchedule.staff_details || [];

                            if (assignedStaff.length === 0) {
                              return (
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="px-4 py-6 text-center text-sm text-gray-500"
                                  >
                                    No staff assigned or staff details not
                                    available
                                  </td>
                                </tr>
                              );
                            }

                            return assignedStaff.map((staff) => (
                              <tr
                                key={staff.catcher_id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {staff.full_name ||
                                    `Staff ${staff.catcher_id}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {staff.contact_number || "N/A"}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    Active
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {selectedSchedule.status !== "completed" && (
                                    <button
                                      onClick={() =>
                                        handleRemoveStaff(
                                          selectedSchedule.id,
                                          staff.catcher_id
                                        )
                                      }
                                      disabled={assignedStaff.length === 1}
                                      className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 text-white hover:bg-red-600"
                                      title={
                                        assignedStaff.length === 1
                                          ? "Cannot remove the last staff member"
                                          : "Remove staff from schedule"
                                      }
                                    >
                                      Remove
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                    {selectedSchedule.staff_details &&
                      selectedSchedule.staff_details.length === 1 && (
                        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                          <ExclamationCircleIcon className="h-4 w-4" />
                          At least one staff member must remain assigned to the
                          patrol schedule.
                        </p>
                      )}
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    Schedule Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Schedule Date
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {selectedSchedule.schedule_date
                            ? new Date(
                                selectedSchedule.schedule_date
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Schedule Time
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {selectedSchedule.schedule_date
                            ? new Date(
                                selectedSchedule.schedule_date
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : selectedSchedule.schedule_time || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedSchedule.notes && (
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Notes
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedSchedule.notes}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-gray-700">
                      {selectedSchedule.created_at
                        ? new Date(selectedSchedule.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-700">
                      {selectedSchedule.updated_at
                        ? new Date(selectedSchedule.updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Dog Catcher Modal */}
      {showAddCatcherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Add New Dog Catcher
                  </h2>
                  <p className="text-white/90 text-sm">
                    Register a new animal catcher to the system
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddCatcherModal(false);
                    setNewCatcherData({ full_name: "", contact_number: "" });
                    setCatcherFormErrors({});
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleAddCatcher} className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={newCatcherData.full_name}
                  onChange={handleCatcherFormChange}
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    catcherFormErrors.full_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {catcherFormErrors.full_name && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {catcherFormErrors.full_name}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={newCatcherData.contact_number}
                  onChange={handleCatcherFormChange}
                  placeholder="Enter contact number"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    catcherFormErrors.contact_number
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {catcherFormErrors.contact_number && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {catcherFormErrors.contact_number}
                  </p>
                )}
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Note</p>
                    <p className="text-xs text-blue-700 mt-1">
                      The new dog catcher will be immediately available for
                      patrol assignment after creation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCatcherModal(false);
                    setNewCatcherData({ full_name: "", contact_number: "" });
                    setCatcherFormErrors({});
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      Add Dog Catcher
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalCatcherSchedule;
