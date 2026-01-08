import { useState, useEffect, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { apiService } from "../../../utils/api";
import LocationPickerModal from "./LocationPickerModal";
import ConfirmDialog from "../../common/ConfirmDialog";

const RegisterAnimalModal = ({ isOpen, onClose, onRegister }) => {
  // Confirmation dialog state
  const [confirmRegister, setConfirmRegister] = useState(false);

  // Color options with hex codes for visual display
  const colorHexMap = {
    Black: "#1a1a1a",
    White: "#f5f5f5",
    Brown: "#8B4513",
    "Tan/Fawn": "#D2B48C",
    Cream: "#FFFDD0",
    "Gray/Silver": "#A9A9A9",
    "Orange/Ginger": "#D2691E",
    "Black & White": "#4B4B4B",
    "Brown & White": "#C4A484",
    Brindle: "#6B4423",
    Merle: "#708090",
    "Tabby/Striped": "#B8860B",
    "Tortoiseshell/Calico": "#C25A3A",
    "Tri-color": "#8B7355",
    Other: "#D3D3D3",
  };

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

  // Color options
  const colorOptions = [
    "Black",
    "White",
    "Brown",
    "Tan/Fawn",
    "Cream",
    "Gray/Silver",
    "Orange/Ginger",
    "Black & White",
    "Brown & White",
    "Brindle",
    "Merle",
    "Tabby/Striped",
    "Tortoiseshell/Calico",
    "Tri-color",
    "Other",
  ];

  // Markings now free-form text (dropdown removed)

  const initialFormData = useMemo(
    () => ({
      rfid: "",
      name: "",
      species: "Dog",
      breed: "",
      sex: "Male",
      color: "",
      markings: "",
      sprayedNeutered: false,
      dateCaptured: "",
      locationCaptured: "",
      registeredBy: "",
      images: {
        front: null,
        back: null,
        left: null,
        right: null,
        top: null,
      },
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [rfidStep, setRfidStep] = useState("prompt"); // prompt | rfidInput | form
  const [rfidValue, setRfidValue] = useState("");
  const [isLoadingPetData, setIsLoadingPetData] = useState(false);
  const [petOwnerData, setPetOwnerData] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapInitialLocation, setMapInitialLocation] = useState(null);

  // Reset to prompt when modal opens and get admin name
  useEffect(() => {
    if (isOpen) {
      setRfidStep("prompt");
      setRfidValue("");
      // Clear any previous state
      setPetOwnerData(null);
      setMapInitialLocation(null);

      // Get admin's full name from localStorage
      const adminName =
        localStorage.getItem("userName") ||
        localStorage.getItem("fullName") ||
        "Admin";

      setFormData({ ...initialFormData, registeredBy: adminName });
      setValidationErrors({});
    }
  }, [isOpen, initialFormData]);

  const fetchPetByRfid = async (rfid) => {
    setIsLoadingPetData(true);
    try {
      const response = await apiService.pets.getByRfid(rfid.trim());

      if (response && response.data) {
        const data = response.data;
        const pet = data.pet || data;
        const owner = data.owner;

        // Normalize species and sex to match form values (capitalize first letter)
        const normalizeSpecies = (val) => {
          if (!val) return "Dog";
          return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        };

        const normalizeSex = (val) => {
          if (!val) return "Male";
          return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        };

        // Pre-populate form with pet data - capture all fields
        setFormData((prev) => ({
          ...prev,
          name: pet.name || "",
          breed: pet.breed || "",
          species: normalizeSpecies(pet.species),
          sex: normalizeSex(pet.sex),
          color: pet.color || "",
          markings: pet.markings || "",
          rfid: rfid.trim(),
          sprayedNeutered: pet.sprayedNeutered || false,
        }));

        // Store owner data for display
        setPetOwnerData(owner || null);

        // Move to form step
        setRfidStep("form");
      } else {
        alert(
          "Pet Not Found. No pet found with this RFID. Please check and try again."
        );
        setRfidValue("");
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      alert(error.message || "Failed to retrieve pet data. Please try again.");
      setRfidValue("");
    } finally {
      setIsLoadingPetData(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.breed) errors.breed = "Breed is required";
    if (!formData.species) errors.species = "Species is required";
    if (!formData.sex) errors.sex = "Sex is required";
    if (!formData.color) errors.color = "Color is required";
    if (!formData.dateCaptured)
      errors.dateCaptured = "Date captured is required";
    if (!formData.locationCaptured?.trim())
      errors.locationCaptured = "Location captured is required";

    // Images and markings are optional

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If species changes, reset breed
    if (name === "species") {
      setFormData({
        ...formData,
        [name]: value,
        breed: "", // Reset breed when species changes
      });
    } else if (name === "sprayedNeutered") {
      setFormData({ ...formData, [name]: value === "true" });
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
    const adminName =
      localStorage.getItem("userName") ||
      localStorage.getItem("fullName") ||
      formData.registeredBy ||
      "Admin";

    setFormData({ ...initialFormData, registeredBy: adminName });
    setPetOwnerData(null);
    setRfidValue("");
  };

  const handleOpenMap = () => {
    setIsMapOpen(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapInitialLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setMapInitialLocation(null);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      locationCaptured: locationData.address,
    });
    setMapInitialLocation({
      lat: locationData.latitude,
      lng: locationData.longitude,
    });
  };

  const handleAddToList = () => {
    if (!validateForm()) return;
    setConfirmRegister(true);
  };

  const confirmRegistration = () => {
    const payload = {
      ...formData,
      registrationDate: new Date().toISOString().split("T")[0],
    };
    setConfirmRegister(false);
    onRegister(payload);
    onClose();
  };

  if (!isOpen) return null;

  // RFID Prompt Screen
  if (rfidStep === "prompt") {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#FA8630] to-[#E87928] rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Does the animal have RFID?
            </h2>
            <p className="text-gray-600 mb-8">
              Choose how you want to register this animal
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRfidStep("rfidInput");
                }}
                className="w-full bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Animal Has RFID
              </button>
              <button
                onClick={() => {
                  setRfidStep("form");
                }}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Animal Has No RFID
              </button>
              <button
                onClick={onClose}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RFID Input Screen
  if (rfidStep === "rfidInput") {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#FA8630] to-[#E87928] rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Enter RFID Code
            </h2>
            <p className="text-gray-600 mb-6">
              Scan or type the RFID before proceeding
            </p>
            <input
              type="text"
              value={rfidValue}
              onChange={(e) => setRfidValue(e.target.value)}
              placeholder="RFID code (9 digits)"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all bg-white shadow-sm mb-6"
              maxLength="9"
              autoFocus
            />
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!rfidValue.trim()) {
                    alert("Please enter an RFID code to continue.");
                    return;
                  }
                  fetchPetByRfid(rfidValue);
                }}
                disabled={isLoadingPetData}
                className="w-full bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPetData ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Continue
                  </>
                )}
              </button>
              <button
                onClick={() => setRfidStep("prompt")}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen (rfidStep === "form")
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-200 flex flex-col">
        {/* Header with Orange Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FA8630] to-[#E87928] p-6 text-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-1">Register New Animal</h2>
              <p className="text-white/85 text-sm">
                Complete the animal registration form
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <form className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Owner Information Card (if RFID found) */}
          {petOwnerData && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pet Owner Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Owner</p>
                  <p className="text-blue-900 font-semibold">
                    {petOwnerData.full_name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Email</p>
                  <p className="text-blue-900 font-semibold text-xs break-all">
                    {petOwnerData.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Contact</p>
                  <p className="text-blue-900 font-semibold">
                    {petOwnerData.contact_number || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Address</p>
                  <p className="text-blue-900 font-semibold text-xs">
                    {petOwnerData.address || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Animal Identification Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Animal Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all ${
                    validationErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Animal name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  RFID (optional)
                </label>
                <input
                  type="text"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  maxLength="9"
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630]"
                  placeholder="9-digit code"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Species *
                </label>
                <div className="flex gap-3">
                  {["Dog", "Cat"].map((sp) => (
                    <label
                      key={sp}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="species"
                        value={sp}
                        checked={formData.species === sp}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#FA8630]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {sp}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sex *
                </label>
                <div className="flex gap-3">
                  {["Male", "Female"].map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sex"
                        value={s}
                        checked={formData.sex === s}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#FA8630]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Characteristics Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Physical Characteristics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Breed *
                </label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] ${
                    validationErrors.breed
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select a breed</option>
                  {breedOptions[formData.species]?.map((breed) => (
                    <option key={breed} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
                {validationErrors.breed && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.breed}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Color *
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs font-medium ${
                        formData.color === color
                          ? "border-[#FA8630] bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border-2 ${
                          color === "White"
                            ? "border-gray-300"
                            : "border-gray-200"
                        }`}
                        style={{
                          backgroundColor: colorHexMap[color] || "#D3D3D3",
                        }}
                      />
                      <span className="line-clamp-2 break-words w-12 text-center">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
                {validationErrors.color && (
                  <p className="text-red-500 text-xs mt-2">
                    {validationErrors.color}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Markings (optional)
                </label>
                <input
                  type="text"
                  name="markings"
                  value={formData.markings}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630]"
                  placeholder="e.g., white patch on chest, brown spots"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sprayed/Neutered? *
                </label>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sprayedNeutered"
                        checked={formData.sprayedNeutered === val}
                        onChange={() =>
                          setFormData({ ...formData, sprayedNeutered: val })
                        }
                        className="w-4 h-4 text-[#FA8630]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {val ? "Yes" : "No"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Capture Information Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Capture Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Captured *
                </label>
                <input
                  type="date"
                  name="dateCaptured"
                  value={formData.dateCaptured}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] ${
                    validationErrors.dateCaptured
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.dateCaptured && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.dateCaptured}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="locationCaptured"
                    value={formData.locationCaptured}
                    readOnly
                    className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
                    placeholder="Click map to select"
                  />
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    className="px-4 py-2 bg-[#FA8630] text-white text-sm font-medium rounded-lg hover:bg-[#E87928] transition-all"
                  >
                    Map
                  </button>
                </div>
                {validationErrors.locationCaptured && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.locationCaptured}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Upload Images *
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {["front", "back", "left", "right", "top"].map((view) => (
                <div
                  key={view}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-gray-400 transition-all"
                >
                  <label className="flex flex-col items-center justify-center cursor-pointer h-24">
                    <span className="text-xs font-semibold text-gray-600 text-center capitalize mb-1">
                      {view}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, view)}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    {formData.images[view]?.preview ? (
                      <img
                        src={formData.images[view].preview}
                        alt={view}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-400"
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
                    )}
                  </label>
                </div>
              ))}
            </div>
            {validationErrors.images && (
              <p className="text-red-500 text-xs mt-2">
                {validationErrors.images}
              </p>
            )}
          </div>

          {/* Admin Info (Registered By) */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Registered By
            </label>
            <input
              type="text"
              value={formData.registeredBy}
              disabled
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToList}
            className="px-6 py-2 text-sm bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white rounded-lg hover:shadow-lg font-medium transition-all"
          >
            Register Stray Animal
          </button>
        </div>
      </div>
      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={handleLocationSelect}
        initialLocation={mapInitialLocation}
      />
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmRegister}
        onClose={() => setConfirmRegister(false)}
        onConfirm={confirmRegistration}
        title="Confirm Registration"
        message={`Are you sure you want to register ${
          formData.name || "this stray animal"
        }? Please verify all information is correct before proceeding.`}
        confirmText="Register"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default RegisterAnimalModal;
