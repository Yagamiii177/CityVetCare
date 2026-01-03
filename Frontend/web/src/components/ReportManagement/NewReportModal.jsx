import { useState } from "react";
import {
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  PlusCircleIcon,
  CalendarIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import MapLocationPicker from "./MapLocationPicker";
import FrontendLogger from "../../utils/logger";

const logger = new FrontendLogger('NEW-REPORT-MODAL');

const NewReportModal = ({ isOpen, onClose, onSubmit }) => {
  // Notification modal state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('error');
  
  // Map location picker state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    // Report Information
    reportType: "",
    contactNumber: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    location: "",
    latitude: null,
    longitude: null,
    // Pet Report Information
    petColor: "",
    petBreed: "",
    animalType: "",
    petGender: "",
    petSize: "",
    images: [],
  });

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle button selection (for animal type, gender, size)
  const handleButtonSelect = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: [...formData.images, ...imageUrls],
    });
  };

  // Handle location selection from map
  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      location: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });
    setIsMapPickerOpen(false);
  };

  // Submit handler with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields (matching mobile form requirements)
    if (!formData.reportType || !formData.animalType || !formData.petGender || !formData.petSize) {
      setNotificationMessage('Please fill all required fields:\n\n• Type of Report\n• Type of Animal\n• Pet\'s Gender\n• Pet\'s Size');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }
    
    logger.debug('Preparing data with mobile structure');

    // Prepare data matching the mobile form structure AND backend expectations
    const newReport = {
      // Backend primary fields
      incident_type: formData.reportType,
      reporter_contact: formData.contactNumber || 'N/A',
      incident_date: `${formData.date} ${new Date().toTimeString().split(' ')[0]}`,
      description: formData.description || 'No description provided',
      location: formData.location || 'Location to be determined',
      latitude: formData.latitude,
      longitude: formData.longitude,
      pet_color: formData.petColor || null,
      pet_breed: formData.petBreed || null,
      animal_type: formData.animalType,
      pet_gender: formData.petGender,
      pet_size: formData.petSize,
      images: formData.images,
      status: "pending",
      reporter_name: "Admin Portal",
      // Also include camelCase for frontend compatibility
      reportType: formData.reportType,
      contactNumber: formData.contactNumber,
      date: formData.date,
      petColor: formData.petColor,
      petBreed: formData.petBreed,
      animalType: formData.animalType,
      petGender: formData.petGender,
      petSize: formData.petSize,
    };
    
    logger.debug('Submitting report', newReport);

    // Call parent submit handler
    onSubmit(newReport);

    // Reset form
    setFormData({
      reportType: "",
      contactNumber: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      location: "",
      latitude: null,
      longitude: null,
      petColor: "",
      petBreed: "",
      animalType: "",
      petGender: "",
      petSize: "",
      images: [],
    });

    // Close modal
    onClose();
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      reportType: "",
      contactNumber: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      location: "",
      latitude: null,
      longitude: null,
      petColor: "",
      petBreed: "",
      animalType: "",
      petGender: "",
      petSize: "",
      images: [],
    });
    onClose();
  };

  // Selection button component for type, gender, size
  const SelectionButton = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
        selected
          ? 'border-[#FA8630] bg-[#FA8630] text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:border-[#FA8630]'
      }`}
    >
      {label}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        <button
          className="absolute right-4 top-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={handleClose}
          type="button"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
        </button>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Report Information</h2>
            <p className="text-gray-600">Fill in the details matching mobile report form</p>
          </div>

          {/* REPORT INFORMATION SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-[#FA8630] pb-2">
              Report Information
            </h3>

            {/* Type of Report */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Report <span className="text-red-500">*</span>
              </label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
              >
                <option value="">Select report type</option>
                <option value="incident">Incident/Bite Report</option>
                <option value="stray">Stray Animal Report</option>
                <option value="lost">Lost Pet Report</option>
              </select>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g., 09438642023"
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                />
              </div>
            </div>

            {/* Date of Incident */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Incident
              </label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                />
              </div>
            </div>

            {/* Location - Pin on Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    readOnly
                    placeholder="Click 'Pin Location' to select on map"
                    className="flex-1 border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="px-4 py-3 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    <MapPinIcon className="h-5 w-5" />
                    Pin Location
                  </button>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="flex gap-2 text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      📍 Lat: {formData.latitude.toFixed(6)}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      📍 Lng: {formData.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Provide additional details about the report..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
              />
            </div>
          </div>

          {/* PET REPORT INFORMATION SECTION */}
          <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-[#FA8630] pb-2">
              Pet Report Information
            </h3>

            {/* Pet's Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet's Color
              </label>
              <input
                type="text"
                name="petColor"
                value={formData.petColor}
                onChange={handleChange}
                placeholder="e.g., Black"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent bg-white"
              />
            </div>

            {/* Pet's Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet's Breed
              </label>
              <input
                type="text"
                name="petBreed"
                value={formData.petBreed}
                onChange={handleChange}
                placeholder="e.g., Labrador, Aspin, etc."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent bg-white"
              />
            </div>

            {/* Type of Animal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Animal <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <SelectionButton
                  label="Dog"
                  selected={formData.animalType === 'dog'}
                  onClick={() => handleButtonSelect('animalType', 'dog')}
                />
                <SelectionButton
                  label="Cat"
                  selected={formData.animalType === 'cat'}
                  onClick={() => handleButtonSelect('animalType', 'cat')}
                />
              </div>
            </div>

            {/* Pet's Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet's Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <SelectionButton
                  label="Male"
                  selected={formData.petGender === 'male'}
                  onClick={() => handleButtonSelect('petGender', 'male')}
                />
                <SelectionButton
                  label="Female"
                  selected={formData.petGender === 'female'}
                  onClick={() => handleButtonSelect('petGender', 'female')}
                />
              </div>
            </div>

            {/* Pet's Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet's Size <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <SelectionButton
                  label="Small"
                  selected={formData.petSize === 'small'}
                  onClick={() => handleButtonSelect('petSize', 'small')}
                />
                <SelectionButton
                  label="Medium"
                  selected={formData.petSize === 'medium'}
                  onClick={() => handleButtonSelect('petSize', 'medium')}
                />
                <SelectionButton
                  label="Large"
                  selected={formData.petSize === 'large'}
                  onClick={() => handleButtonSelect('petSize', 'large')}
                />
              </div>
            </div>

            {/* Upload Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Tap to upload photos (Views of reported pet)
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-[#FA8630] hover:bg-white transition-all bg-white"
                >
                  <PhotoIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-600">Tap to upload photos</span>
                </label>
              </div>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== idx);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#FA8630] text-white px-6 py-3 rounded-lg hover:bg-[#E87928] transition-colors font-medium flex items-center justify-center gap-2"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Submit Report
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-8 bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className={`p-6 border-b ${
              notificationType === 'error' ? 'border-red-100' : 'border-green-100'
            }`}>
              <div className="flex items-center gap-3">
                {notificationType === 'error' ? (
                  <div className="p-2 bg-red-100 rounded-full">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${
                  notificationType === 'error' ? 'text-red-900' : 'text-green-900'
                }`}>
                  {notificationType === 'error' ? 'Validation Error' : 'Success'}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-line">{notificationMessage}</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end rounded-b-xl">
              <button
                onClick={() => setShowNotification(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  notificationType === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialPosition={
          formData.latitude && formData.longitude
            ? { lat: formData.latitude, lng: formData.longitude }
            : null
        }
      />
    </div>
  );
};

export default NewReportModal;
