import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const RegisterAnimalModal = ({ isOpen, onClose, onRegister }) => {
  // Breed options by species - alphabetically sorted
  const breedOptions = {
    Dog: [
      "Beagle",
      "Boxer",
      "Bulldog",
      "Chihuahua",
      "Dachshund",
      "German Shepherd",
      "Golden Retriever",
      "Great Dane",
      "Labrador Retriever",
      "Mixed Breed",
      "Other",
      "Poodle",
      "Rottweiler",
      "Shih Tzu",
      "Siberian Husky",
      "Yorkshire Terrier",
    ],
    Cat: [
      "Abyssinian",
      "Bengal",
      "British Shorthair",
      "Domestic Longhair",
      "Domestic Shorthair",
      "Maine Coon",
      "Mixed Breed",
      "Other",
      "Persian",
      "Ragdoll",
      "Russian Blue",
      "Scottish Fold",
      "Siamese",
      "Sphynx",
    ],
  };

  // Marking options - alphabetically sorted
  const markingOptions = [
    "Bi-color",
    "Brindle",
    "Harlequin",
    "Merle",
    "Other",
    "Patched",
    "Piebald",
    "Points (Siamese pattern)",
    "Roan",
    "Solid Color",
    "Spotted",
    "Striped/Tabby",
    "Tri-color",
    "Tuxedo",
  ];

  // Simple counter for demo purposes
  const generateSequentialId = () => {
    return Math.floor(Math.random() * 1000) + 1;
  };

  const initialFormData = {
    id: generateSequentialId(),
    species: "Dog",
    breed: "",
    sex: "Male",
    marking: "",
    hasTag: "",
    tagNumber: "",
    captureDate: "",
    locationCaptured: "",
    notes: "",
    status: "Healthy",
    images: {
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If species changes, reset breed
    if (name === "species") {
      setFormData({
        ...formData,
        [name]: value,
        breed: "", // Reset breed when species changes
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e, view) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          images: {
            ...formData.images,
            [view]: {
              file,
              preview: event.target.result,
            },
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearForm = () => {
    setFormData({
      ...initialFormData,
      id: generateSequentialId(),
    });
  };

  const handleOpenMap = () => {
    const sampleAddress = "123 Main Street, City, State 12345";
    setFormData({ ...formData, locationCaptured: sampleAddress });
    alert(
      "Map would open here to select location. Using sample address for demo."
    );
  };

  const handleAddToObservation = () => {
    const observationData = {
      ...formData,
      status: "Observation",
    };
    onRegister(observationData);
    onClose();
  };

  const handleAddToList = () => {
    onRegister(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-white to-gray-50/80 p-8 pb-6 border-b border-gray-200 backdrop-blur-sm z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Register New Animal
              </h2>
              <p className="text-gray-600 text-sm">
                Fill in the details below to register a new animal to the system
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>
          </div>
        </div>

        <form className="p-8 space-y-8">
          <div className="space-y-8">
            {/* ID Field */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Animal ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 font-mono font-bold text-lg shadow-sm"
                    readOnly
                    disabled
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs font-medium text-[#FA8630] bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                      Auto-generated
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Unique identifier for this animal record
                </p>
              </div>
            </div>

            {/* Species and Breed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Species <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="species"
                        value="Dog"
                        checked={formData.species === "Dog"}
                        onChange={handleChange}
                        className="h-5 w-5 text-[#FA8630] focus:ring-2 focus:ring-[#FA8630] focus:ring-offset-2 border-gray-300"
                      />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                      Dog
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="species"
                        value="Cat"
                        checked={formData.species === "Cat"}
                        onChange={handleChange}
                        className="h-5 w-5 text-[#FA8630] focus:ring-2 focus:ring-[#FA8630] focus:ring-offset-2 border-gray-300"
                      />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                      Cat
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Breed <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm appearance-none cursor-pointer pr-10"
                    required
                  >
                    <option value="">Select a breed</option>
                    {breedOptions[formData.species]?.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sex and Marking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Sex <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="sex"
                        value="Male"
                        checked={formData.sex === "Male"}
                        onChange={handleChange}
                        className="h-5 w-5 text-[#FA8630] focus:ring-2 focus:ring-[#FA8630] focus:ring-offset-2 border-gray-300"
                      />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                      Male
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="sex"
                        value="Female"
                        checked={formData.sex === "Female"}
                        onChange={handleChange}
                        className="h-5 w-5 text-[#FA8630] focus:ring-2 focus:ring-[#FA8630] focus:ring-offset-2 border-gray-300"
                      />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                      Female
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Marking <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="marking"
                    value={formData.marking}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm appearance-none cursor-pointer pr-10"
                    required
                  >
                    <option value="">Select marking pattern</option>
                    {markingOptions.map((marking) => (
                      <option key={marking} value={marking}>
                        {marking}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Has Tag? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="hasTag"
                      value="yes"
                      checked={formData.hasTag === "yes"}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#FA8630] focus:ring-2 focus:ring-[#FA8630] focus:ring-offset-2 border-gray-300"
                    />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                    Yes
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="hasTag"
                      value="no"
                      checked={formData.hasTag === "no"}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#FA8630] focus:ring-2 focus:ring-[#FA8630] focus:ring-offset-2 border-gray-300"
                    />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                    No
                  </span>
                </label>
              </div>

              {formData.hasTag === "yes" && (
                <div className="space-y-2 bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Tag Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tagNumber"
                    value={formData.tagNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm"
                    placeholder="Enter tag number"
                    required
                  />
                </div>
              )}
            </div>

            {/* Capture Date and Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Capture Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="captureDate"
                  value={formData.captureDate}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm"
                  required
                />
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Location Captured <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="locationCaptured"
                    value={formData.locationCaptured}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm"
                    placeholder="Select location on map"
                    required
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold shadow-md hover:shadow-orange-200 flex items-center space-x-2"
                  >
                    <span>Open Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm resize-none"
                placeholder="Any additional observations or notes about the animal..."
              />
            </div>

            {/* Upload Images */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Upload Animal Images
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["front", "back", "left", "right", "top"].map((view) => (
                  <div
                    key={view}
                    className="border-3 border-dashed border-gray-300 rounded-2xl p-4 hover:border-gray-400 transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 group"
                  >
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <span className="text-sm font-semibold text-gray-600 mb-3 capitalize group-hover:text-gray-700 transition-colors">
                        {view} View
                      </span>
                      <div className="relative w-full h-32">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, view)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {formData.images[view]?.preview ? (
                          <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl border-2 border-gray-200">
                            <img
                              src={formData.images[view].preview}
                              alt={`${view} view preview`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-4 px-2 bg-white rounded-xl border-2 border-gray-200 group-hover:border-gray-300 transition-colors">
                            <svg
                              className="w-10 h-10 text-gray-400 mb-2 group-hover:text-gray-500 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-500 text-center group-hover:text-gray-600 transition-colors">
                              Click to upload {view} view
                            </span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white pt-6 pb-4 border-t border-gray-200 mt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex gap-3 w-full lg:w-auto order-2 lg:order-1">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex-1 lg:flex-none shadow-sm"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex-1 lg:flex-none shadow-sm"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-3 w-full lg:w-auto order-1 lg:order-2">
                <button
                  type="button"
                  onClick={handleAddToObservation}
                  className="px-6 py-3 text-sm bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-xl text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold flex-1 lg:flex-none shadow-sm"
                >
                  Add to Observation
                </button>
                <button
                  type="button"
                  onClick={handleAddToList}
                  className="px-8 py-3 text-sm bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold shadow-md hover:shadow-orange-200 flex-1 lg:flex-none"
                >
                  Add to Stray List
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAnimalModal;
