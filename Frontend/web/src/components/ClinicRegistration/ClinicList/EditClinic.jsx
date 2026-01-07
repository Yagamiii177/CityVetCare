import { useState, useEffect } from "react";
import {
  XMarkIcon,
  BuildingOffice2Icon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import LocationPicker from "./LocationPicker";

const EditClinic = ({ clinic, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    veterinarian: "",
    licenseNumber: "",
    email: "",
    phone: "",
    address: "",
    barangay: "",
    latitude: "",
    longitude: "",
    services: [],
    status: "Pending",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const availableServices = [
    "General Care",
    "Surgery",
    "Dental",
    "Emergency",
    "X-Ray",
    "Laboratory",
    "Grooming",
    "Vaccination",
  ];

  useEffect(() => {
    if (clinic && isOpen) {
      setFormData({
        name: clinic.name || "",
        veterinarian: clinic.veterinarian || "",
        licenseNumber: clinic.licenseNumber || "",
        email: clinic.email || "",
        phone: clinic.phone || "",
        address: clinic.address || "",
        barangay: clinic.barangay || "",
        latitude: clinic.latitude || "",
        longitude: clinic.longitude || "",
        services: clinic.services || [],
        status: clinic.status || "Pending",
      });
    }
  }, [clinic, isOpen]);

  const showNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
  };

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-() ]+$/.test(phone);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      showNotification("Please enter clinic name");
      return;
    }

    if (!formData.veterinarian.trim()) {
      showNotification("Please enter veterinarian name");
      return;
    }

    if (!formData.licenseNumber.trim()) {
      showNotification("Please enter license number");
      return;
    }

    if (!formData.email.trim()) {
      showNotification("Please enter email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      showNotification("Please enter a valid email address");
      return;
    }

    if (!formData.phone.trim()) {
      showNotification("Please enter phone number");
      return;
    }

    if (!validatePhone(formData.phone)) {
      showNotification("Please enter a valid phone number");
      return;
    }

    if (!formData.address.trim()) {
      showNotification("Please enter clinic address");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      id: clinic.id,
      ...formData,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    try {
      await onSave(payload);
      showNotification("Clinic updated successfully", "success");

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error("Error updating clinic:", err);
      showNotification(err?.message || "Failed to update clinic", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !clinic) return null;

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 animate-slide-down">
          <div
            className={`w-full max-w-lg rounded-lg px-6 py-4 shadow-lg ${
              notification.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 h-5 w-5 ${
                  notification.type === "error"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {notification.type === "error" ? (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Edit Clinic Details
              </h2>
              <p className="text-sm text-gray-500">
                Update clinic information for {clinic.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="p-6">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Name *
                    </label>
                    <div className="relative">
                      <BuildingOffice2Icon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter clinic name"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Head Veterinarian *
                    </label>
                    <div className="relative">
                      <UserIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        name="veterinarian"
                        value={formData.veterinarian}
                        onChange={handleInputChange}
                        placeholder="e.g., Dr. John Smith"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <div className="relative">
                      <DocumentTextIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., VET-2024-001"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-t pt-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="clinic@example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Address *
                    </label>
                    <div className="relative">
                      <MapPinIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter complete address"
                        rows={3}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barangay
                    </label>
                    <input
                      type="text"
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleInputChange}
                      placeholder="e.g., Poblacion, Ermita"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    />
                  </div>

                  <LocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationSelect={(lat, lng) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-t pt-4">
                  Services Offered
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableServices.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`p-2 border rounded-lg text-sm transition-colors ${
                        formData.services.includes(service)
                          ? "border-[#FA8630] bg-[#FA8630]/5 text-[#FA8630] font-medium"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.services.length} service(s)
                </p>
              </div>

              {/* Status Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-t pt-4">
                  Status
                </h3>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default EditClinic;
