import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import { NotificationModal } from "../../components/ReportManagement/Modal";
import { apiService } from "../../utils/api";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const SubmitIncidentReportPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("form"); // "form" or "reports"
  const [reports, setReports] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal state
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  // Form data
  const [formData, setFormData] = useState({
    type: "",
    location: "",
    reporterName: "",
    reporterContact: "",
    reporterAddress: "",
    details: "",
    animalType: "",
    animalCount: 1,
    injuries: "",
    severity: "Low",
    followUpRequired: true,
  });

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch reports from backend
  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      const response = await apiService.incidents.getAll();
      const transformedReports = response.data.records.map(incident => ({
        id: `RPT-${incident.id.toString().padStart(3, '0')}`,
        type: incident.title,
        location: incident.location,
        date: incident.incident_date ? incident.incident_date.split(' ')[0] : incident.created_at.split(' ')[0],
        time: incident.incident_date ? incident.incident_date.split(' ')[1] : incident.created_at.split(' ')[1],
        reporterName: incident.reporter_name,
        reporterContact: incident.reporter_contact,
        reporterAddress: incident.location,
        details: incident.description,
        animalType: extractAnimalType(incident.description),
        animalCount: 1,
        injuries: extractInjuries(incident.description),
        severity: incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1),
        status: incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' '),
        assignedTo: incident.catcher_team_name || "",
        followUpRequired: true,
      }));
      setReports(transformedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Test API connection
  const testConnection = async () => {
    try {
      console.log("🧪 Testing API connection...");
      const response = await apiService.incidents.getAll();
      setNotificationModal({
        isOpen: true,
        title: 'Connection Success',
        message: `API Connection Test SUCCESS!\n\nTotal incidents: ${response.data?.total || 0}\n\nBackend is connected and working!`,
        type: 'success'
      });
    } catch (error) {
      setNotificationModal({
        isOpen: true,
        title: 'Connection Failed',
        message: `API Connection Test FAILED\n\nError: ${error.message}\n\nCheck console (F12) for details.`,
        type: 'error'
      });
      console.error("Connection test failed:", error);
    }
  };

  const extractAnimalType = (description) => {
    if (!description) return "Unknown";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('dog')) return 'Dog';
    if (lowerDesc.includes('cat')) return 'Cat';
    return 'Unknown';
  };

  const extractInjuries = (description) => {
    if (!description) return "None";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('bite') || lowerDesc.includes('injury') || lowerDesc.includes('wound')) {
      return description;
    }
    return "None";
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? e.target.checked : value 
    });
  };



  // Submit handler with improved error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.type || !formData.location || !formData.reporterName || !formData.reporterContact || !formData.details) {
      setNotificationModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fill in all required fields:\n- Incident Type\n- Location\n- Reporter Name\n- Contact Number\n- Incident Details',
        type: 'warning'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare data for backend
      const incidentData = {
        title: formData.type,
        description: `${formData.details}${formData.injuries ? '\n\nInjuries: ' + formData.injuries : ''}${formData.animalType ? '\nAnimal Type: ' + formData.animalType : ''}${formData.animalCount > 1 ? '\nAnimal Count: ' + formData.animalCount : ''}`,
        location: formData.location,
        status: 'pending',
        priority: formData.severity.toLowerCase(),
        reporter_name: formData.reporterName,
        reporter_contact: formData.reporterContact,
        incident_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      console.log("📤 Submitting incident report...");
      console.log("Data:", incidentData);

      // Submit to backend
      const response = await apiService.incidents.create(incidentData);
      console.log("✅ SUCCESS! Response:", response.data);

      // Reset form
      setFormData({
        type: "",
        location: "",
        reporterName: "",
        reporterContact: "",
        reporterAddress: "",
        details: "",
        animalType: "",
        animalCount: 1,
        injuries: "",
        severity: "Low",
        followUpRequired: true,
      });

      // Show success message
      setNotificationModal({
        isOpen: true,
        title: 'Success!',
        message: `Incident report submitted successfully!\n\nReport ID: ${response.data.id || 'Created'}\n\nThe report will now appear in all admin tables.`,
        type: 'success'
      });
      
      // Refresh reports and switch to reports tab
      await fetchReports();
      setActiveTab("reports");
      
      setSubmitting(false);
    } catch (error) {
      console.error("❌ SUBMISSION FAILED:");
      console.error("Full error:", error);
      
      // Detailed error message for user
      let errorMsg = "❌ Failed to submit report\n\n";
      
      if (error.response) {
        // Server responded with error
        errorMsg += `Server Error (${error.response.status})\n`;
        errorMsg += `Details: ${error.response.data?.message || JSON.stringify(error.response.data)}\n\n`;
        errorMsg += `API URL: ${error.config?.url}`;
      } else if (error.request) {
        // Request made but no response
        errorMsg += "No response from server.\n\n";
        errorMsg += "Please check:\n";
        errorMsg += "1. Backend server is running (Node.js on port 3000)\n";
        errorMsg += "2. Check VITE_API_URL in .env file\n";
        errorMsg += "3. Check browser console (F12) for details";
      } else {
        // Something else went wrong
        errorMsg += `Error: ${error.message}\n\n`;
        errorMsg += "Check console (F12) for more details.";
      }
      
      setNotificationModal({
        isOpen: true,
        title: 'Submission Failed',
        message: errorMsg,
        type: 'error'
      });
      setSubmitting(false);
    }
  };

  // Filtering
  const filteredReports = reports.filter((r) =>
    r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity) => {
    const styles = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-orange-100 text-orange-800",
      Critical: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Resolved: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "City Vet Staff" }}
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
        <div className="p-8 flex flex-col gap-6">

          {/* Header with Tabs */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Submit Walk-in Incident Report</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={testConnection}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
              >
                🧪 Test API
              </button>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setActiveTab("form")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "form"
                      ? "bg-[#FA8630] text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  New Report
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "reports"
                      ? "bg-[#FA8630] text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  View Reports ({reports.length})
                </button>
              </div>
            </div>
          </div>

          {activeTab === "form" ? (
            /* Report Submission Form */
            <form
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Incident Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Incident Information
                  </h3>

                  {/* Incident Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Incident Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    >
                      <option value="">Select incident type</option>
                      <option value="Animal Bite">Animal Bite</option>
                      <option value="Rabies Suspected">Rabies Suspected</option>
                      <option value="Stray Animal Report">Stray Animal Report</option>
                      <option value="Animal Nuisance">Animal Nuisance</option>
                      <option value="Animal Attack">Animal Attack</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Incident Location *
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="Enter exact location of incident"
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Animal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Animal Type
                      </label>
                      <select
                        name="animalType"
                        value={formData.animalType}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      >
                        <option value="">Select animal</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Animal Count
                      </label>
                      <input
                        type="number"
                        name="animalCount"
                        value={formData.animalCount}
                        onChange={handleChange}
                        min="1"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Incident Severity
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Reporter Information
                  </h3>

                  {/* Reporter Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Reporter Name *
                    </label>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="reporterName"
                        value={formData.reporterName}
                        onChange={handleChange}
                        required
                        placeholder="Enter reporter's full name"
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Contact Number *
                    </label>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="reporterContact"
                        value={formData.reporterContact}
                        onChange={handleChange}
                        required
                        placeholder="09123456789"
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Reporter Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Reporter Address
                    </label>
                    <textarea
                      name="reporterAddress"
                      value={formData.reporterAddress}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter complete address"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    />
                  </div>

                  {/* Injuries */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Injuries Sustained
                    </label>
                    <textarea
                      name="injuries"
                      value={formData.injuries}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Describe any injuries from the incident"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Incident Details *
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Provide detailed description of the incident..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                />
              </div>

              {/* Follow-up Required */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#FA8630] focus:ring-[#FA8630] border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-600">
                  Follow-up required
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FA8630] text-white px-6 py-3 rounded-lg hover:bg-[#E87928] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  {submitting ? 'Submitting...' : 'Submit Incident Report'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      type: "",
                      location: "",
                      reporterName: "",
                      reporterContact: "",
                      reporterAddress: "",
                      details: "",
                      animalType: "",
                      animalCount: 1,
                      injuries: "",
                      severity: "Low",
                      followUpRequired: true,
                    });
                  }}
                  className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Form
                </button>
              </div>
            </form>
          ) : (
            /* Reports List View */
            <div className="space-y-4">
              {/* Search */}
              <div className="flex items-center gap-3 max-w-md relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 text-gray-400" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                  placeholder="Search reports by ID, type, location, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")}>
                    <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>

              {/* Reports Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#FA8630]/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Report ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Type & Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.length ? (
                      filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono font-medium text-gray-900">{report.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">{report.type}</p>
                              {getSeverityBadge(report.severity)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{report.reporterName}</p>
                              <p className="text-xs text-gray-500">{report.reporterContact}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 max-w-xs truncate">{report.location}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900">{report.date}</p>
                              <p className="text-xs text-gray-500">{report.time}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(report.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No reports found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
      />
    </div>
  );
};

export default SubmitIncidentReportPage;