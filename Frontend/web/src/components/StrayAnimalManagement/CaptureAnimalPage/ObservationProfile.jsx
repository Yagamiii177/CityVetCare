import { useState, useEffect } from "react";
import { apiService } from "../../../utils/api";
import {
  XMarkIcon,
  PencilSquareIcon,
  CheckIcon,
  IdentificationIcon,
  QrCodeIcon,
  TagIcon,
  SwatchIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserCircleIcon,
  PhotoIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const ObservationProfile = ({ animal, onClose, isOpen, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnimal, setEditedAnimal] = useState(animal);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);

  useEffect(() => {
    setEditedAnimal(animal);
    setIsEditing(false);
  }, [animal]);

  // Fetch owner details when RFID is present
  useEffect(() => {
    const fetchOwner = async () => {
      setOwnerInfo(null);
      setOwnerError(null);
      if (!animal?.rfid || !/^\d{9}$/.test(String(animal.rfid))) return;
      try {
        setOwnerLoading(true);
        const res = await apiService.pets.getByRfid(String(animal.rfid));
        const data = res?.data?.data || res?.data || res;
        setOwnerInfo(data?.owner || null);
      } catch (e) {
        setOwnerError("Unable to load owner details");
      } finally {
        setOwnerLoading(false);
      }
    };
    fetchOwner();
  }, [animal?.rfid]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedAnimal((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(editedAnimal);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedAnimal(animal);
    setIsEditing(false);
  };

  // Format date to "Month Day, Year" (e.g., "June 07, 2025")
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

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

  const placeholderUrl =
    "https://via.placeholder.com/300x300.png?text=No+Image";

  const handleImageFileChange = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedAnimal((prev) => ({
        ...prev,
        images: {
          ...(prev.images || {}),
          [key]: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (key) => {
    setEditedAnimal((prev) => {
      const nextImages = { ...(prev.images || {}) };
      delete nextImages[key];
      return { ...prev, images: nextImages };
    });
  };

  const displayedImages =
    editedAnimal?.images && Object.values(editedAnimal.images).length > 0
      ? Object.entries(editedAnimal.images)
      : animal?.imageUrls && animal.imageUrls.length > 0
      ? animal.imageUrls.map((url, idx) => [`image-${idx}`, url])
      : animal?.primaryImage
      ? [["primary", animal.primaryImage]]
      : [];

  const statusLabel = animal?.status
    ? animal.status.replace(/_/g, " ")
    : "Captured";

  const statusTone = statusLabel.toLowerCase().includes("adoption")
    ? "bg-green-100 text-green-700"
    : statusLabel.toLowerCase().includes("euth")
    ? "bg-red-100 text-red-700"
    : "bg-blue-100 text-blue-700";

  const quickFacts = [
    { label: "RFID", value: editedAnimal.rfid || "-" },
    { label: "Species", value: editedAnimal.species || "Unknown" },
    { label: "Breed", value: editedAnimal.breed || "Unspecified" },
    { label: "Color", value: editedAnimal.color || "Unspecified" },
    { label: "Captured", value: formatDate(editedAnimal.dateCaptured) },
    {
      label: "Registration",
      value: formatDate(editedAnimal.registrationDate),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header with orange gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FA8630] to-[#E87928] p-6 rounded-t-2xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedAnimal.name || ""}
                      onChange={handleInputChange}
                      className="border-0 rounded-lg px-3 py-2 text-3xl font-bold focus:ring-2 focus:ring-white focus:border-white bg-white/20 text-white placeholder-white/70"
                      placeholder="Animal name"
                    />
                  ) : (
                    `${animal.name}'s Profile`
                  )}
                </h2>
                <span className="inline-flex items-center rounded-full bg-white/20 text-white text-xs font-semibold px-3 py-1 backdrop-blur-sm border border-white/30">
                  ID #{editedAnimal.id || animal.id}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-white/85 flex items-center gap-1">
                📍 {editedAnimal.locationCaptured || "Location unavailable"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#FA8630] rounded-lg hover:bg-gray-100 transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
                  >
                    <CheckIcon className="h-5 w-5" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-lg hover:bg-white/30 transition-all text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-lg hover:bg-white/30 transition-all text-sm font-semibold"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 transition-all hover:scale-105"
                aria-label="Close profile"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div className="p-6 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <InformationCircleIcon className="h-4 w-4 text-[#FA8630]" />
                  Snapshot
                </h3>
                <span className="text-xs text-gray-500">
                  Key details at a glance
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                      {fact.label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Images */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4 text-[#FA8630]" />
                  Images
                </h3>
                <span className="text-xs text-gray-500">
                  Upload or paste URLs for each angle
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayedImages.map(([key, url], idx) => (
                  <div
                    key={`${key}-${idx}`}
                    className="aspect-square rounded-md overflow-hidden border border-gray-200 bg-white relative"
                  >
                    <img
                      src={url}
                      alt={`${animal?.name || "Animal"} image ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleImageRemove(key)}
                        className="absolute top-1 right-1 bg-white/80 text-gray-600 rounded-full h-7 w-7 flex items-center justify-center shadow"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                      {key}
                    </div>
                  </div>
                ))}
                {displayedImages.length === 0 && (
                  <div className="text-sm text-gray-500 col-span-2 sm:col-span-3">
                    No images available for this animal.
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Files are converted to base64 for quick preview. URLs are
                    saved as-is.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["front", "back", "left", "right", "top"].map((key) => (
                      <div
                        key={key}
                        className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
                      >
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {key.charAt(0).toUpperCase() + key.slice(1)} Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageFileChange(key, e.target.files?.[0])
                          }
                          className="block w-full text-sm text-gray-700 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer bg-white"
                        />
                        <input
                          type="text"
                          value={editedAnimal.images?.[key] || ""}
                          onChange={(e) =>
                            setEditedAnimal((prev) => ({
                              ...prev,
                              images: {
                                ...(prev.images || {}),
                                [key]: e.target.value,
                              },
                            }))
                          }
                          className="w-full border border-gray-200 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                          placeholder={`https://... (${key})`}
                        />
                        {editedAnimal.images?.[key] && (
                          <button
                            type="button"
                            onClick={() => handleImageRemove(key)}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            <span>Remove {key} image</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <IdentificationIcon className="h-5 w-5 text-[#FA8630]" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <IdentificationIcon className="h-4 w-4 text-[#FA8630]" />
                      <span className="font-semibold">ID:</span>{" "}
                      <span className="font-mono">#{editedAnimal.id}</span>
                    </p>
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editedAnimal.name || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Name:</span>{" "}
                        <span>{editedAnimal.name || "N/A"}</span>
                      </p>
                    )}
                  </div>

                  {/* Owner details (display only) */}
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Owner Name:</span>{" "}
                      <span>{editedAnimal.ownerName || "Unknown"}</span>
                    </p>
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Species
                        </label>
                        <select
                          name="species"
                          value={editedAnimal.species || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                        </select>
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Species:</span>{" "}
                        <span>{editedAnimal.species || "Unspecified"}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Breed
                        </label>
                        <input
                          type="text"
                          name="breed"
                          value={editedAnimal.breed || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Breed:</span>{" "}
                        <span>{editedAnimal.breed || "Unspecified"}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Sex
                        </label>
                        <select
                          name="sex"
                          value={editedAnimal.sex || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Sex:</span>{" "}
                        <span>{editedAnimal.sex || "Unspecified"}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical Characteristics */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <SwatchIcon className="h-5 w-5 text-[#FA8630]" />
                  Physical Characteristics
                </h3>
                <div className="space-y-3">
                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <select
                          name="color"
                          value={editedAnimal.color || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="">Select color</option>
                          {colorOptions.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Color:</span>{" "}
                        <span>{editedAnimal.color || "Unspecified"}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Markings
                        </label>
                        <select
                          name="markings"
                          value={editedAnimal.markings || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="">Select markings</option>
                          {markingOptions.map((marking) => (
                            <option key={marking} value={marking}>
                              {marking}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Markings:</span>{" "}
                        <span>{editedAnimal.markings || "Unspecified"}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Sprayed/Neutered
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sprayedNeutered"
                              value={true}
                              checked={editedAnimal.sprayedNeutered === true}
                              onChange={() =>
                                setEditedAnimal((prev) => ({
                                  ...prev,
                                  sprayedNeutered: true,
                                }))
                              }
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sprayedNeutered"
                              value={false}
                              checked={editedAnimal.sprayedNeutered === false}
                              onChange={() =>
                                setEditedAnimal((prev) => ({
                                  ...prev,
                                  sprayedNeutered: false,
                                }))
                              }
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Sprayed/Neutered:</span>{" "}
                        <span>
                          {editedAnimal.sprayedNeutered ? "Yes" : "No"}
                        </span>
                      </p>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          RFID
                        </label>
                        <input
                          type="text"
                          name="rfid"
                          value={editedAnimal.rfid || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded px-2 py-1"
                          maxLength="9"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <QrCodeIcon className="h-4 w-4 text-[#FA8630]" />
                        <span className="font-semibold">RFID:</span>{" "}
                        <span className="font-mono">
                          {editedAnimal.rfid || "-"}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Capture & Registration Details */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-[#FA8630]" />
                Capture & Registration Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {isEditing ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Date Captured
                      </label>
                      <input
                        type="date"
                        name="dateCaptured"
                        value={editedAnimal.dateCaptured || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 text-[#FA8630]" />
                      <span className="font-semibold">Date Captured:</span>{" "}
                      <span>{formatDate(editedAnimal.dateCaptured)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-[#FA8630]" />
                    <span className="font-semibold">
                      Registration Date:
                    </span>{" "}
                    <span>{formatDate(editedAnimal.registrationDate)}</span>
                  </p>
                </div>

                <div>
                  {isEditing ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Location Captured
                      </label>
                      <input
                        type="text"
                        name="locationCaptured"
                        value={editedAnimal.locationCaptured || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-[#FA8630]" />
                      <span className="font-semibold">
                        Location Captured:
                      </span>{" "}
                      <span>{editedAnimal.locationCaptured}</span>
                    </p>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Captured By
                      </label>
                      <input
                        type="text"
                        name="capturedBy"
                        value={editedAnimal.capturedBy || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <UserCircleIcon className="h-4 w-4 text-[#FA8630]" />
                      <span className="font-semibold">Captured By:</span>{" "}
                      <span>{editedAnimal.capturedBy || "N/A"}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Information (if RFID linked) */}
            {editedAnimal?.rfid && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <UserCircleIcon className="h-5 w-5 text-[#FA8630]" />
                  Owner Information
                </h3>
                {ownerLoading ? (
                  <p className="text-sm text-gray-500">
                    Loading owner details...
                  </p>
                ) : ownerError ? (
                  <p className="text-sm text-red-600">{ownerError}</p>
                ) : ownerInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Owner Name:</span>{" "}
                        <span>
                          {ownerInfo.full_name || ownerInfo.fullName || "N/A"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Contact Number:</span>{" "}
                        <span>
                          {ownerInfo.contact_number ||
                            ownerInfo.contactNumber ||
                            "N/A"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Email:</span>{" "}
                        <span>{ownerInfo.email || "N/A"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Address:</span>{" "}
                        <span>{ownerInfo.address || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No owner linked to this RFID.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationProfile;
