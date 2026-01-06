import { useEffect, useState } from "react";
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
import EditObservation from "../../components/StrayAnimalManagement/CaptureAnimalPage/AddObservation";
import { apiService } from "../../utils/api";

const CaptureAnimalPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("captured");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    breed: "",
    observationStatus: "",
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [capturedAnimals, setCapturedAnimals] = useState([]);
  const [observationAnimals, setObservationAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const normalizeAnimal = (animal) => {
    const fallbackName = animal?.name
      ? animal.name
      : animal?.id
      ? `Stray #${animal.id}`
      : "Stray Animal";

    return {
      ...animal,
      pastObservations: animal?.pastObservations || [],
      name: fallbackName,
      gender: animal?.gender || animal?.sex || "Unknown",
      location: animal?.location || animal?.locationCaptured || "",
      dateCaptured: animal?.captureDate || animal?.dateCaptured || null,
    };
  };

  const applyNormalization = (list = []) =>
    list.map((item) => normalizeAnimal(item));

  const formatToday = () => new Date().toISOString().split("T")[0];

  const unwrapData = (response) => response?.data?.data ?? response?.data ?? [];

  const handleApiError = (message, apiError) => {
    console.error(message, apiError);
    setError(message);
  };

  const loadAnimals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [capturedRes, observationRes] = await Promise.all([
        apiService.strayAnimals.list({ status: "captured" }),
        apiService.strayAnimals.list({ status: "observation" }),
      ]);

      setCapturedAnimals(applyNormalization(unwrapData(capturedRes)));
      setObservationAnimals(applyNormalization(unwrapData(observationRes)));
    } catch (apiError) {
      handleApiError("Unable to load animals", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, []);

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
      observationStatus: "",
    });
    setSearchTerm("");
  };

  const handleRegisterAnimal = async (formData) => {
    setError(null);
    try {
      setIsLoading(true);
      const payload = {
        species: formData.species,
        breed: formData.breed,
        sex: formData.sex,
        marking: formData.marking,
        hasTag: formData.hasTag === "yes" || formData.hasTag === true,
        tagNumber: formData.tagNumber || "",
        captureDate: formData.captureDate,
        locationCaptured: formData.locationCaptured,
        notes: formData.notes || "",
        status: formData.status === "Observation" ? "observation" : "captured",
        observationNotes:
          formData.status === "Observation"
            ? formData.notes || ""
            : formData.observationNotes || "",
        dateObserved:
          formData.status === "Observation"
            ? formData.captureDate
            : formData.dateObserved,
      };

      const response = await apiService.strayAnimals.create(payload);
      const createdAnimal = normalizeAnimal(unwrapData(response));

      if (createdAnimal.status === "observation") {
        setObservationAnimals((prev) => [...prev, createdAnimal]);
      } else {
        setCapturedAnimals((prev) => [...prev, createdAnimal]);
      }

      setIsRegisterModalOpen(false);
    } catch (apiError) {
      handleApiError("Unable to register animal", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (animal) => {
    setSelectedAnimal(normalizeAnimal(animal));
    setIsProfileOpen(true);
  };

  const handleSaveObservation = async (updatedAnimal) => {
    setError(null);
    try {
      const payload = {
        observationNotes:
          updatedAnimal.observationNotes || updatedAnimal.notes || "",
        pastObservations: updatedAnimal.pastObservations || [],
        status: "observation",
        dateObserved: updatedAnimal.dateObserved || formatToday(),
        notes: updatedAnimal.notes || "",
      };

      const response = await apiService.strayAnimals.update(
        updatedAnimal.id,
        payload
      );

      const saved = normalizeAnimal(unwrapData(response));
      setObservationAnimals((prev) =>
        prev.map((animal) => (animal.id === saved.id ? saved : animal))
      );
      setSelectedAnimal(saved);
    } catch (apiError) {
      handleApiError("Unable to save observation", apiError);
    }
  };

  const handleSaveAnimal = async (updatedAnimal) => {
    setError(null);
    try {
      const payload = {
        species: updatedAnimal.species,
        breed: updatedAnimal.breed,
        sex: updatedAnimal.sex || updatedAnimal.gender,
        marking: updatedAnimal.marking,
        hasTag: updatedAnimal.hasTag === "yes" || updatedAnimal.hasTag === true,
        tagNumber: updatedAnimal.tagNumber || "",
        captureDate: updatedAnimal.captureDate || updatedAnimal.dateCaptured,
        locationCaptured:
          updatedAnimal.locationCaptured || updatedAnimal.location || "",
        notes: updatedAnimal.notes || updatedAnimal.observationNotes || "",
        observationNotes:
          updatedAnimal.observationNotes || updatedAnimal.notes || "",
        status: updatedAnimal.status || activeTab,
        pastObservations: updatedAnimal.pastObservations || [],
      };

      const response = await apiService.strayAnimals.update(
        updatedAnimal.id,
        payload
      );

      const saved = normalizeAnimal(unwrapData(response));

      if ((saved.status || activeTab) === "captured") {
        setCapturedAnimals((prev) =>
          prev.map((animal) => (animal.id === saved.id ? saved : animal))
        );
      } else {
        setObservationAnimals((prev) =>
          prev.map((animal) => (animal.id === saved.id ? saved : animal))
        );
      }

      setSelectedAnimal(saved);
    } catch (apiError) {
      handleApiError("Unable to save animal", apiError);
    }
  };

  const handleSendToObservation = async (animal) => {
    setError(null);
    try {
      const response = await apiService.strayAnimals.updateStatus(animal.id, {
        status: "observation",
        observationNotes: animal.notes || "No notes provided",
        dateObserved: formatToday(),
      });

      const updated = normalizeAnimal(unwrapData(response));
      setCapturedAnimals((prev) => prev.filter((a) => a.id !== animal.id));
      setObservationAnimals((prev) => [...prev, updated]);
    } catch (apiError) {
      handleApiError("Unable to move to observation", apiError);
    } finally {
      setShowDropdown(null);
    }
  };

  const handleSendToCaptured = async (animal) => {
    setError(null);
    try {
      const response = await apiService.strayAnimals.updateStatus(animal.id, {
        status: "captured",
        notes: animal.observationNotes || "No notes provided",
        observationNotes: animal.observationNotes || "",
      });

      const updated = normalizeAnimal(unwrapData(response));
      setObservationAnimals((prev) => prev.filter((a) => a.id !== animal.id));
      setCapturedAnimals((prev) => [...prev, updated]);
    } catch (apiError) {
      handleApiError("Unable to move to captured", apiError);
    } finally {
      setShowDropdown(null);
    }
  };

  const handleSendToAdoption = async (animal) => {
    setError(null);
    try {
      const response = await apiService.strayAnimals.updateStatus(animal.id, {
        status: "adoption",
        dateAddedToAdoption: formatToday(),
      });

      unwrapData(response);
      setCapturedAnimals((prev) => prev.filter((a) => a.id !== animal.id));
    } catch (apiError) {
      handleApiError("Unable to move to adoption list", apiError);
    } finally {
      setShowDropdown(null);
    }
  };

  const filteredAnimals =
    activeTab === "captured"
      ? capturedAnimals.filter((animal) => {
          if (!animal) return false;

          const matchesSearch =
            searchTerm === "" ||
            animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.locationCaptured
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            animal.tagNumber?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesSpecies =
            filters.species === "" || animal.species === filters.species;

          const matchesBreed =
            filters.breed === "" || animal.breed === filters.breed;

          return matchesSearch && matchesSpecies && matchesBreed;
        })
      : observationAnimals.filter((animal) => {
          if (!animal) return false;

          const matchesSearch =
            searchTerm === "" ||
            animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.locationCaptured
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            animal.tagNumber?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesObservationStatus =
            filters.observationStatus === "" ||
            animal.observationNotes
              ?.toLowerCase()
              .includes(filters.observationStatus.toLowerCase());

          const matchesSpecies =
            filters.species === "" || animal.species === filters.species;

          const matchesBreed =
            filters.breed === "" || animal.breed === filters.breed;

          return (
            matchesSearch &&
            matchesObservationStatus &&
            matchesSpecies &&
            matchesBreed
          );
        });

  const hasFilters =
    filters.species !== "" ||
    filters.breed !== "" ||
    filters.observationStatus !== "" ||
    searchTerm !== "";

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
              <h1 className="text-2xl font-bold">Captured Animals</h1>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#E87928] transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Register A Stray
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E8E8E8] mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "captured"
                    ? "text-[#FA8630] border-b-2 border-[#FA8630]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("captured")}
              >
                Captured Animals ({capturedAnimals.length})
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "observation"
                    ? "text-[#FA8630] border-b-2 border-[#FA8630]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("observation")}
              >
                Under Observation ({observationAnimals.length})
              </button>
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
                    placeholder="Search by breed, location, or tag number"
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

                  {/* Observation Status Filter - Only for observation tab */}
                  {activeTab === "observation" && (
                    <div className="relative flex-1 min-w-[140px]">
                      <select
                        name="observationStatus"
                        value={filters.observationStatus}
                        onChange={handleFilterChange}
                        className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                      >
                        <option value="">All Observations</option>
                        <option value="limping">Limping</option>
                        <option value="underweight">Underweight</option>
                        <option value="injured">Injured</option>
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
              {/* Table Header - Fixed */}
              <div className="flex-shrink-0 bg-[#FA8630]/10">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Species/Breed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Sex
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Marking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Tag
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        {activeTab === "captured"
                          ? "Capture Date"
                          : "Date Observed"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        {activeTab === "captured"
                          ? "Notes"
                          : "Observation Notes"}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Table Body - Scrollable */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8]">
                  <tbody className="bg-white divide-y divide-[#E8E8E8]">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="9"
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
                          onClick={() => handleRowClick(animal)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            #{animal.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{animal.species}</div>
                            <div className="text-gray-500">{animal.breed}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {animal.sex || animal.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {animal.marking}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {animal.hasTag ? (
                              <span className="text-orange-800 font-medium px-3 py-1 rounded-full text-xs">
                                {animal.tagNumber}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No tag
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {animal.locationCaptured || animal.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {activeTab === "captured"
                              ? animal.captureDate || animal.dateCaptured
                              : animal.dateObserved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="truncate max-w-xs inline-block">
                              {activeTab === "captured"
                                ? animal.notes
                                : animal.observationNotes}
                            </span>
                          </td>
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
                                      {activeTab === "captured" ? (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendToObservation(animal);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Send to Observation
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendToAdoption(animal);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Send to Adoption List
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedAnimal(
                                                normalizeAnimal(animal)
                                              );
                                              setIsEditModalOpen(true);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Add Observation
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendToCaptured(animal);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Send to Captured List
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
                          colSpan="9"
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

        <RegisterAnimalModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegister={handleRegisterAnimal}
        />

        {selectedAnimal && (
          <ObservationProfile
            animal={selectedAnimal}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onSave={handleSaveAnimal}
          />
        )}

        {isEditModalOpen && selectedAnimal && (
          <EditObservation
            animal={selectedAnimal}
            onClose={() => setIsEditModalOpen(false)}
            onSave={
              activeTab === "captured"
                ? handleSaveAnimal
                : handleSaveObservation
            }
          />
        )}
      </main>
    </div>
  );
};

export default CaptureAnimalPage;
