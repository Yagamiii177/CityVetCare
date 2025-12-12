import { useState } from "react";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const NewReportModal = ({ isOpen, onClose, onSubmit }) => {
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

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? e.target.checked : value,
    });
  };

  // Submit handler with validation and better error handling
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.type || !formData.location || !formData.reporterName || !formData.reporterContact || !formData.details) {
      alert("⚠️ Please fill in all required fields marked with *");
      return;
    }
    
    console.log("📝 New Report Modal - Preparing data...");

    const newReport = {
      type: formData.type,
      location: formData.location,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      reporterName: formData.reporterName,
      reporterContact: formData.reporterContact,
      reporterAddress: formData.reporterAddress,
      details: formData.details,
      animalType: formData.animalType,
      animalCount: parseInt(formData.animalCount) || 1,
      injuries: formData.injuries,
      severity: formData.severity,
      status: "Pending",
      assignedTo: "",
      followUpRequired: formData.followUpRequired,
    };
    
    console.log("📦 Submitting report:", newReport);

    // Call parent submit handler
    onSubmit(newReport);

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

    // Close modal
    onClose();
  };

  // Reset form when modal closes
  const handleClose = () => {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        <button
          className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={handleClose}
        >
          <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
        </button>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Submit New Incident Report</h2>
            <p className="text-gray-600">Fill in the details of the incident report</p>
          </div>

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
                  <option value="Bite Incident">Bite Incident</option>
                  <option value="Rabies Suspected">Rabies Suspected</option>
                  <option value="Stray Animal">Stray Animal</option>
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
              className="flex-1 bg-[#FA8630] text-white px-6 py-3 rounded-lg hover:bg-[#E87928] transition-colors font-medium flex items-center justify-center gap-2"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Submit Incident Report
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReportModal;
