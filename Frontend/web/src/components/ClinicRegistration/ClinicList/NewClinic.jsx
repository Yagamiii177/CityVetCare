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
import ClinicLocationPicker from "../ClinicLocationPicker";

const NewClinic = ({ isOpen, onClose, onCreate }) => {
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

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
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

  const showNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
  };

  // Auto-hide notification after 3 seconds
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
      ...formData,
      registrationDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    try {
      await onCreate(payload);

      showNotification("Clinic registered successfully", "success");

      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({
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
        setStep(1);
      }, 800);
    } catch (err) {
      console.error("Error creating clinic:", err);
      showNotification(err?.message || "Failed to register clinic", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate before proceeding
    if (step === 1) {
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
    } else if (step === 2) {
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
    }

    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!isOpen) return null;

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
                Register New Clinic
              </h2>
              <p className="text-sm text-gray-500">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-[#FA8630] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`h-1 w-20 mx-2 ${
                        step > stepNumber ? "bg-[#FA8630]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Basic Info</span>
              <span>Contact</span>
              <span>Services</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="p-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
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
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
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

                {/* Location Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={
                        formData.latitude && formData.longitude
                          ? `${parseFloat(formData.latitude).toFixed(
                              6
                            )}, ${parseFloat(formData.longitude).toFixed(6)}`
                          : "Click 'Pin Location' to select on map"
                      }
                      readOnly
                      placeholder="Click 'Pin Location' to select on map"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-default focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker(true)}
                      className="px-6 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#e67929] transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <MapPinIcon className="w-5 h-5" />
                      Pin Location
                    </button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      Latitude: {parseFloat(formData.latitude).toFixed(6)},
                      Longitude: {parseFloat(formData.longitude).toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Services Offered (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableServices.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`p-3 border rounded-lg text-sm transition-colors ${
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

                {/* Preview Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Registration Summary
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Clinic Name:</span>
                      <span className="text-right">
                        {formData.name || "Not entered"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Veterinarian:</span>
                      <span className="text-right">
                        {formData.veterinarian || "Not entered"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License:</span>
                      <span className="text-right">
                        {formData.licenseNumber || "Not entered"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-right">
                        {formData.email || "Not entered"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span className="text-right">
                        {formData.phone || "Not entered"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Services:</span>
                      <span className="text-right">
                        {formData.services.length > 0
                          ? `${formData.services.length} selected`
                          : "None selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200">
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {step < 3 ? (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-4 py-2 text-sm bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors flex items-center gap-2"
                    >
                      Continue
                      <span>→</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ← Edit
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
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Register Clinic
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Location Picker Modal */}
      <ClinicLocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={(location) => {
          setFormData((prev) => ({
            ...prev,
            latitude: location.lat.toString(),
            longitude: location.lng.toString(),
          }));
          setShowLocationPicker(false);
        }}
        initialPosition={
          formData.latitude && formData.longitude
            ? {
                lat: parseFloat(formData.latitude),
                lng: parseFloat(formData.longitude),
              }
            : null
        }
      />

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

export default NewClinic;
