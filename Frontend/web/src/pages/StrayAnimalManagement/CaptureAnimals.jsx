import { useEffect, useState, useCallback } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import RegisterAnimalModal from "../../components/StrayAnimalManagement/CaptureAnimalPage/RegisterAnimalModal";
import ObservationProfile from "../../components/StrayAnimalManagement/CaptureAnimalPage/ObservationProfile";
import { apiService, getImageUrl } from "../../utils/api";
import logo from "../../assets/logo.png";

const PLACEHOLDER_IMAGE = logo;

const CaptureAnimalPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    breed: "",
  });
  const [activeTab, setActiveTab] = useState("stray"); // stray, owned, adoption
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [capturedAnimals, setCapturedAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ownerNames, setOwnerNames] = useState({}); // rfid -> owner full_name
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Euthanize modal state
  const [euthModalOpen, setEuthModalOpen] = useState(false);
  const [euthTarget, setEuthTarget] = useState(null);
  const [euthReason, setEuthReason] = useState("");
  const [euthSubmitting, setEuthSubmitting] = useState(false);
  const [euthError, setEuthError] = useState("");

  // Alert Owner modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTarget, setAlertTarget] = useState(null);
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const [alertError, setAlertError] = useState("");

  // Breed options by species
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

  const isValidRemoteImage = (url) => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed.startsWith("file:")) return false; // ignore local device URIs
    return (
      trimmed.startsWith("http") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("/uploads") ||
      trimmed.startsWith("uploads/")
    );
  };

  const toDisplayUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (
      trimmed.startsWith("http") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }
    return getImageUrl(trimmed);
  };

  const extractImageUrls = (images) => {
    if (!images) return [];
    const toArray = () => {
      if (Array.isArray(images)) return images;
      if (typeof images === "string") {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === "string") return [parsed];
          if (parsed && typeof parsed === "object")
            return Object.values(parsed);
        } catch {
          return [images];
        }
      }
      if (typeof images === "object") return Object.values(images);
      return [];
    };

    return toArray()
      .filter(Boolean)
      .map((u) => (typeof u === "string" ? u.trim() : u))
      .filter(isValidRemoteImage)
      .map(toDisplayUrl)
      .filter(Boolean);
  };

  const normalizeAnimal = (animal) => {
    const fallbackName = animal?.name
      ? animal.name
      : animal?.id
      ? `Stray #${animal.id}`
      : "Stray Animal";

    const imageUrls = extractImageUrls(animal?.images);

    return {
      ...animal,
      name: fallbackName,
      codeName:
        !animal?.rfid || String(animal.rfid).trim() === ""
          ? fallbackName
          : animal?.name || fallbackName,
      gender: animal?.sex || "Unknown",
      location: animal?.locationCaptured || "",
      dateCaptured: animal?.dateCaptured || null,
      imageUrls,
      primaryImage: imageUrls[0] || PLACEHOLDER_IMAGE,
    };
  };

  const applyNormalization = (list = []) =>
    list.map((item) => normalizeAnimal(item));

  // Removed unused formatToday to satisfy lint rules

  const unwrapData = (response) => response?.data?.data ?? response?.data ?? [];

  const handleApiError = (message, apiError) => {
    console.error(message, apiError);
    setError(message);
  };

  const loadAnimals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allRes = await apiService.strayAnimals.list();
      const all = applyNormalization(unwrapData(allRes));
      setCapturedAnimals(all);
    } catch (apiError) {
      handleApiError("Unable to load animals", apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  // When viewing owned tab, fetch owner names for RFIDs not yet resolved
  useEffect(() => {
    const fetchOwnerNames = async () => {
      if (activeTab !== "owned") return;

      // Check if user is authenticated
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn("No auth token found. Cannot fetch owner data.");
        return;
      }

      const rfids = Array.from(
        new Set(
          capturedAnimals
            .filter((a) => a?.rfid && String(a.rfid).trim() !== "")
            .map((a) => String(a.rfid).trim())
        )
      );
      const toFetch = rfids.filter((r) => ownerNames[r] === undefined);
      if (toFetch.length === 0) return;
      try {
        const results = await Promise.allSettled(
          toFetch.map((r) => apiService.pets.getByRfid(r))
        );
        const updates = {};
        results.forEach((res, idx) => {
          const rfid = toFetch[idx];
          if (res.status === "fulfilled") {
            // Pet API returns { success: true, pet: {...}, owner: {...} }
            const responseData = res.value?.data || res.value;
            const ownerFullName =
              responseData?.owner?.full_name ||
              responseData?.owner?.fullName ||
              null;
            console.log(`✓ Fetched owner for RFID ${rfid}:`, ownerFullName);
            updates[rfid] = ownerFullName || null;
          } else {
            console.error(
              `✗ Failed to fetch owner for RFID ${toFetch[idx]}:`,
              res.reason?.message || res.reason
            );
            updates[rfid] = null;
          }
        });
        setOwnerNames((prev) => ({ ...prev, ...updates }));
      } catch (error) {
        console.error("Error in owner name fetch batch:", error);
      }
    };
    fetchOwnerNames();
  }, [activeTab, capturedAnimals, ownerNames]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // If species changes, reset breed filter
    if (name === "species") {
      setFilters({ ...filters, [name]: value, breed: "" });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      species: "",
      breed: "",
    });
    setSearchTerm("");
  };

  const openProfile = (animal) => {
    const normalized = normalizeAnimal(animal);
    const ownerName = ownerNames[String(normalized.rfid)?.trim()] || null;
    setSelectedAnimal({
      ...normalized,
      ownerName,
      images: animal.images || normalized.images,
    });
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
    setSelectedAnimal(null);
    setShowDropdown(null);
  };

  const handleRegisterAnimal = async (formData) => {
    setError(null);
    try {
      setIsLoading(true);
      // Only include web-accessible image URLs; drop base64 previews
      const filterAllowedImages = (imagesObj) => {
        const entries = Object.entries(imagesObj || {});
        const allowed = entries
          .map(([key, val]) => [key, val?.preview || null])
          .filter(
            ([, url]) =>
              typeof url === "string" &&
              (url.startsWith("http://") ||
                url.startsWith("https://") ||
                url.startsWith("/uploads") ||
                url.startsWith("uploads/") ||
                // Allow base64 data URLs; backend persists these to /uploads/stray
                url.startsWith("data:image/"))
          );
        return allowed.length ? Object.fromEntries(allowed) : undefined;
      };

      const payload = {
        rfid: formData.rfid || null,
        name: formData.name || null,
        species: formData.species,
        breed: formData.breed || null,
        sex: formData.sex,
        color: formData.color || null,
        markings: formData.markings || null,
        sprayedNeutered: Boolean(formData.sprayedNeutered),
        capturedBy: formData.registeredBy || null,
        registeredBy: formData.registeredBy || null,
        dateCaptured: formData.dateCaptured,
        registrationDate:
          formData.registrationDate || new Date().toISOString().split("T")[0],
        locationCaptured: formData.locationCaptured,
        images: filterAllowedImages(formData.images),
      };

      const response = await apiService.strayAnimals.create(payload);
      const createdAnimal = normalizeAnimal(unwrapData(response));

      setCapturedAnimals((prev) => [...prev, createdAnimal]);

      setIsRegisterModalOpen(false);
    } catch (apiError) {
      handleApiError("Unable to register animal", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnimal = async (updatedAnimal) => {
    setError(null);
    try {
      const payload = {
        rfid: updatedAnimal.rfid,
        name: updatedAnimal.name,
        species: updatedAnimal.species,
        breed: updatedAnimal.breed,
        sex: updatedAnimal.sex || updatedAnimal.gender,
        color: updatedAnimal.color,
        markings: updatedAnimal.markings,
        sprayedNeutered: Boolean(updatedAnimal.sprayedNeutered),
        capturedBy: updatedAnimal.capturedBy,
        registeredBy: updatedAnimal.capturedBy,
        dateCaptured: updatedAnimal.dateCaptured,
        registrationDate: updatedAnimal.registrationDate,
        locationCaptured:
          updatedAnimal.locationCaptured || updatedAnimal.location || "",
        images: updatedAnimal.images || undefined,
      };

      const response = await apiService.strayAnimals.update(
        updatedAnimal.id,
        payload
      );

      const saved = normalizeAnimal(unwrapData(response));
      setCapturedAnimals((prev) =>
        prev.map((animal) => (animal.id === saved.id ? saved : animal))
      );
      setSelectedAnimal((prev) =>
        prev && prev.id === saved.id ? saved : prev
      );
      return saved;
    } catch (apiError) {
      handleApiError("Unable to save animal", apiError);
    }
  };

  // Action handlers
  const handlePutToAdoption = async (animal) => {
    try {
      setShowDropdown(null);
      await apiService.strayAnimals.putToAdoption(animal.id);
      await loadAnimals();
    } catch (error) {
      handleApiError("Failed to move animal to adoption", error);
    }
  };

  // Open euthanize modal (replaces native prompts)
  const handleEuthanize = (animal) => {
    setShowDropdown(null);
    setEuthTarget(normalizeAnimal(animal));
    setEuthReason("");
    setEuthError("");
    setEuthModalOpen(true);
  };

  const confirmEuthanize = async () => {
    if (!euthTarget) return;
    if (!euthReason.trim()) {
      setEuthError("Reason is required.");
      return;
    }
    try {
      setEuthSubmitting(true);
      const adminId = localStorage.getItem("userId");
      await apiService.strayAnimals.euthanize(euthTarget.id, {
        reason: euthReason.trim(),
        performedBy: adminId,
      });

      // Notify any owners who have redemption requests (pending or approved) for this animal
      try {
        const redemptionResponse = await apiService.redemptionRequests.list();
        const allRequests =
          redemptionResponse?.data?.data || redemptionResponse?.data || [];
        const normalizeStatus = (status) => {
          const s = String(status || "").toLowerCase();
          if (["approved", "accept", "accepted", "approve"].includes(s))
            return "approved";
          if (["rejected", "declined", "decline"].includes(s))
            return "rejected";
          if (["archived", "archive"].includes(s)) return "archived";
          return "pending";
        };
        const relatedRequests = allRequests.filter(
          (req) =>
            req.stray_id === euthTarget.id &&
            req.owner_id &&
            ["pending", "approved"].includes(normalizeStatus(req.status))
        );

        for (const request of relatedRequests) {
          try {
            await apiService.notifications.createForUser({
              userId: request.owner_id,
              userType: "owner",
              title: "Animal Euthanized",
              message: `We regret to inform you that ${
                euthTarget.name || "the stray animal"
              } you requested for redemption has been euthanized.\n\nReason: ${euthReason.trim()}`,
              type: "euthanization",
            });
          } catch (notifError) {
            console.error("Failed to notify owner:", notifError);
          }
        }
      } catch (redemptionError) {
        console.error("Failed to check redemption requests:", redemptionError);
      }

      // Additionally, notify the registered owner (if any) via RFID lookup
      try {
        const rfidVal = String(euthTarget?.rfid || "").trim();
        if (rfidVal) {
          const petRes = await apiService.pets.getByRfid(rfidVal);
          const ownerData = petRes?.data?.owner || petRes?.owner || null;
          const ownerId =
            ownerData?.user_id || ownerData?.id || ownerData?.owner_id || null;
          if (ownerId) {
            await apiService.notifications.createForUser({
              userId: ownerId,
              userType: "owner",
              title: "Registered Pet Euthanized",
              message: `We regret to inform you that your registered pet ${
                euthTarget.name || "(unnamed)"
              } has been euthanized.\n\nReason: ${euthReason.trim()}`,
              type: "euthanization",
            });
          }
        }
      } catch (ownerNotifError) {
        console.error("Failed to notify registered owner:", ownerNotifError);
      }

      setEuthModalOpen(false);
      setEuthTarget(null);
      setEuthReason("");
      await loadAnimals();
    } catch (error) {
      handleApiError("Failed to euthanize animal", error);
    } finally {
      setEuthSubmitting(false);
    }
  };

  const handleAlertOwner = (animal) => {
    setShowDropdown(null);
    setAlertTarget(normalizeAnimal(animal));
    setAlertResult(null);
    setAlertError("");
    setAlertModalOpen(true);
  };

  const confirmAlertOwner = async () => {
    if (!alertTarget) return;
    try {
      setAlertSubmitting(true);
      const result = await apiService.strayAnimals.alertOwner(alertTarget.id);
      setAlertResult(result?.data?.notifications || {});
    } catch (error) {
      setAlertError(
        error?.response?.data?.message || "Unable to send owner alert"
      );
    } finally {
      setAlertSubmitting(false);
    }
  };

  const filteredAnimals = (() => {
    // Filter by status and ownership
    const capturedOwned = capturedAnimals.filter(
      (a) => a?.rfid && String(a.rfid).trim() !== "" && a.status === "captured"
    );
    const capturedStray = capturedAnimals.filter(
      (a) =>
        (!a?.rfid || String(a.rfid).trim() === "") && a.status === "captured"
    );
    const adoptionList = capturedAnimals.filter((a) => a.status === "adoption");

    const baseList =
      activeTab === "owned"
        ? capturedOwned
        : activeTab === "adoption"
        ? adoptionList
        : capturedStray;

    const matchesCommonFilters = (animal) => {
      if (!animal) return false;
      const matchesSearch =
        searchTerm === "" ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.locationCaptured
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        animal.rfid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activeTab === "owned" &&
          (ownerNames[String(animal.rfid)?.trim()] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        animal.codeName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies =
        filters.species === "" || animal.species === filters.species;
      const matchesBreed =
        filters.breed === "" || animal.breed === filters.breed;
      return matchesSearch && matchesSpecies && matchesBreed;
    };

    return baseList.filter(matchesCommonFilters);
  })();

  const hasFilters =
    filters.species !== "" || filters.breed !== "" || searchTerm !== "";

  // Calculate days captured
  const calculateDaysCaptured = (dateCaptured) => {
    if (!dateCaptured) return "-";
    const captureDate = new Date(dateCaptured);
    const today = new Date();
    const diffTime = today - captureDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : "-";
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - City Veterinarian" }}
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
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="px-6 py-8 flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Stray Animals</h1>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:brightness-105"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Register a Stray
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { key: "stray", label: "Stray Animals (No RFID)" },
                  { key: "owned", label: "Owned/Registered Strays (RFID)" },
                  { key: "adoption", label: "Adoption List" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm transition-all ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-[#FA8630] to-[#E87928] text-white hover:shadow-md"
                        : "bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by breed, location, or RFID"
                    className="pl-10 pr-4 py-2 w-full border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 flex-1 min-w-[300px] max-w-lg">
                  {/* Species Filter */}
                  <div className="relative flex-1 min-w-[120px]">
                    <select
                      name="species"
                      value={filters.species}
                      onChange={handleFilterChange}
                      className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                    >
                      <option value="">All Species</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Breed Filter - Only show when species is selected */}
                  {filters.species && (
                    <div className="relative flex-1 min-w-[140px]">
                      <select
                        name="breed"
                        value={filters.breed}
                        onChange={handleFilterChange}
                        className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                      >
                        <option value="">All Breeds</option>
                        {breedOptions[filters.species]?.map((breed) => (
                          <option key={breed} value={breed}>
                            {breed}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {hasFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap ml-auto"
                  >
                    <XMarkIcon className="h-6 w-6 mr-1" />
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 -mt-2 pb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Table Container - Fixed height with proper scrolling */}
          <div className="flex-1 px-6 pb-8 overflow-hidden mb-15">
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8] table-fixed">
                  <thead className="bg-[#FA8630]/10 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[90px]">
                        ID
                      </th>
                      {activeTab === "owned" ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[110px]">
                            RFID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[140px]">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[160px]">
                            Owner Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[120px]">
                            Species
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[150px]">
                            Date Captured
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[160px]">
                            Registration Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[120px]">
                            Days Captured
                          </th>
                        </>
                      ) : activeTab === "adoption" ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[110px]">
                            RFID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[140px]">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[120px]">
                            Species
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[140px]">
                            Breed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[150px]">
                            Date Captured
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[130px]">
                            Days in Adoption
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[140px]">
                            Code Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[120px]">
                            Species
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[150px]">
                            Date Captured
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[160px]">
                            Registration Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[120px]">
                            Days Captured
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#FA8630] uppercase tracking-wider w-[140px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E8E8E8]">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={
                            activeTab === "owned"
                              ? 9
                              : activeTab === "adoption"
                              ? 8
                              : 7
                          }
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Loading animals...
                        </td>
                      </tr>
                    ) : filteredAnimals.length > 0 ? (
                      filteredAnimals.map((animal) => (
                        <tr
                          key={animal.id}
                          className="hover:bg-[#FA8630]/5 cursor-pointer"
                          onClick={() => openProfile(animal)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            #{animal.id}
                          </td>
                          {activeTab === "owned" ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                {animal.rfid || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {animal.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {ownerNames[String(animal.rfid)?.trim()] || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {animal.species}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {animal.dateCaptured}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {animal.registrationDate || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#FA8630]">
                                {calculateDaysCaptured(animal.dateCaptured)}{" "}
                                days
                              </td>
                            </>
                          ) : activeTab === "adoption" ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                {animal.rfid || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {animal.codeName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {animal.species}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {animal.breed || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {animal.dateCaptured}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                {calculateDaysCaptured(animal.dateCaptured)}{" "}
                                days
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {animal.codeName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {animal.species}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {animal.dateCaptured}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {animal.registrationDate || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#FA8630]">
                                {calculateDaysCaptured(animal.dateCaptured)}{" "}
                                days
                              </td>
                            </>
                          )}

                          <td
                            className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end">
                              <div className="relative inline-block text-left">
                                <div>
                                  <button
                                    type="button"
                                    className="inline-flex justify-center w-full rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDropdown(
                                        showDropdown === animal.id
                                          ? null
                                          : animal.id
                                      );
                                    }}
                                  >
                                    <EllipsisVerticalIcon className="h-5 w-5 text-[#FA8630]" />
                                  </button>
                                </div>

                                {showDropdown === animal.id && (
                                  <div
                                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                    style={{
                                      position: "fixed",
                                      minWidth: "14rem",
                                    }}
                                  >
                                    <div
                                      className="py-1"
                                      role="menu"
                                      aria-orientation="vertical"
                                    >
                                      {/* Show different actions based on RFID presence and current tab */}
                                      {activeTab !== "adoption" ? (
                                        <>
                                          {animal.rfid ? (
                                            /* Owned animal actions */
                                            <>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAlertOwner(animal);
                                                }}
                                                className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 w-full text-left"
                                                role="menuitem"
                                              >
                                                📢 Alert Owner
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePutToAdoption(animal);
                                                }}
                                                className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50 hover:text-green-900 w-full text-left"
                                                role="menuitem"
                                              >
                                                🏠 Send to Adoption List
                                              </button>
                                            </>
                                          ) : (
                                            /* Stray animal actions */
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handlePutToAdoption(animal);
                                              }}
                                              className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50 hover:text-green-900 w-full text-left"
                                              role="menuitem"
                                            >
                                              🏠 Put to Adoption List
                                            </button>
                                          )}

                                          {/* Euthanize option */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEuthanize(animal);
                                            }}
                                            className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 w-full text-left border-t border-gray-100"
                                            role="menuitem"
                                          >
                                            ⚠️ Euthanize
                                          </button>
                                        </>
                                      ) : (
                                        /* Adoption list actions */
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEuthanize(animal);
                                            }}
                                            className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            ⚠️ Euthanize
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={
                            activeTab === "owned"
                              ? 9
                              : activeTab === "adoption"
                              ? 8
                              : 7
                          }
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No animals found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {isProfileOpen && selectedAnimal && (
          <ObservationProfile
            animal={selectedAnimal}
            isOpen={isProfileOpen}
            onClose={closeProfile}
            onSave={async (animal) => {
              const saved = await handleSaveAnimal(animal);
              if (saved) setSelectedAnimal(saved);
            }}
          />
        )}

        <RegisterAnimalModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegister={handleRegisterAnimal}
        />

        {/* Euthanize Confirmation Modal */}
        {euthModalOpen && euthTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !euthSubmitting && setEuthModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Euthanization
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => !euthSubmitting && setEuthModalOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                      ⚠️
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      You are about to euthanize
                      <span className="font-semibold">
                        {" "}
                        {euthTarget.codeName || euthTarget.name}
                      </span>
                      . This action is permanent and cannot be undone.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="mr-3">
                        Species: {euthTarget.species}
                      </span>
                      {euthTarget.rfid && (
                        <span className="font-mono">
                          RFID: {euthTarget.rfid}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for euthanization
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200 focus:border-red-300 min-h-[90px]"
                    placeholder="Provide a clear reason (e.g., severe injury, infectious disease, humane grounds)"
                    value={euthReason}
                    onChange={(e) => {
                      setEuthReason(e.target.value);
                      if (euthError) setEuthError("");
                    }}
                    disabled={euthSubmitting}
                  />
                  {euthError && (
                    <p className="mt-1 text-sm text-red-600">{euthError}</p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setEuthModalOpen(false)}
                  disabled={euthSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  onClick={confirmEuthanize}
                  disabled={euthSubmitting}
                >
                  {euthSubmitting && (
                    <span className="inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  )}
                  Confirm Euthanize
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Owner Modal */}
        {alertModalOpen && alertTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !alertSubmitting && setAlertModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Alert Pet Owner
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => !alertSubmitting && setAlertModalOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      📢
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      Notify the owner of
                      <span className="font-semibold">
                        {" "}
                        {alertTarget.codeName || alertTarget.name}
                      </span>
                      about capture details.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="mr-3">
                        Species: {alertTarget.species}
                      </span>
                      {alertTarget.rfid ? (
                        <span className="font-mono">
                          RFID: {alertTarget.rfid}
                        </span>
                      ) : (
                        <span className="text-red-600">No RFID available</span>
                      )}
                    </div>
                  </div>
                </div>

                {alertError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {alertError}
                  </div>
                )}

                {alertResult && (
                  <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
                    <div className="font-medium mb-1">
                      Alert sent successfully
                    </div>
                    <div className="text-green-700">
                      Channels:{" "}
                      {Object.entries(alertResult)
                        .filter(([, ok]) => ok)
                        .map(([ch]) => ch)
                        .join(", ") || "none"}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setAlertModalOpen(false)}
                  disabled={alertSubmitting}
                >
                  {alertResult ? "Close" : "Cancel"}
                </button>
                {!alertResult && (
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    onClick={confirmAlertOwner}
                    disabled={alertSubmitting || !alertTarget.rfid}
                  >
                    {alertSubmitting && (
                      <span className="inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    )}
                    Send Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaptureAnimalPage;
