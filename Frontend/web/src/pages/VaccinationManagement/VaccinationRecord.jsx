import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/VaccinationManagement/Drawer";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import AddVaccine from "../../components/VaccinationManagement/AddVaccine";
import ObservationProfile from "../../components/VaccinationManagement/Profile";


const VaccinationRecords = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("captured");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    species: "",
    observationStatus: "",
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);

  const [capturedAnimals, setCapturedAnimals] = useState([
    {
      id: 1,
      name: "Toothless",
      species: "Cat",
      breed: "Persian",
      gender: "Female",
      color: "White and Gray",
      marking: "Long silky fur, flat face",
      images: {},
      vaccinations: [
        {
          vaccine: "Feline Viral Rhinotrachei tis (FVR/FHV-1)",
          dateAdministered: "2024-02-10",
          nextVaccination: "2025-02-10",
          veterinarian: "Dr. Martinez"
        },
        {
          vaccine: "Feline Calicivirus (FCV)",
          dateAdministered: "2024-02-10",
          nextVaccination: "2025-02-10",
          veterinarian: "Dr. Martinez"
        }
      ],
      pastObservations: [
        {
          date: "2024-02-05",
          notes: "Found in residential garden, appears well-groomed",
          status: "Healthy",
        },
      ],
    },
    {
      id: 2,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      gender: "Male",
      color: "Golden",
      marking: "Friendly demeanor, wagging tail",
      images: {},
      vaccinations: [
        {
          vaccine: "Canine Distemper Virus (CDV)",
          dateAdministered: "2024-02-12",
          nextVaccination: "2025-02-12",
          veterinarian: "Dr. Rodriguez"
        },
        {
          vaccine: "Canine Parvovirus (CPV)",
          dateAdministered: "2024-02-12",
          nextVaccination: "2025-02-12",
          veterinarian: "Dr. Rodriguez"
        }
      ],
      pastObservations: [
        {
          date: "2024-02-08",
          notes: "Found wandering near shopping center, very friendly",
          status: "Healthy",
        },
      ],
    },
    {
      id: 3,
      name: "Sunny",
      species: "Cat",
      breed: "Domestic Shorthair",
      gender: "Male",
      color: "Black",
      marking: "Yellow eyes, sleek coat",
      images: {},
      vaccinations: [
        {
          vaccine: "Feline Panleukopenia (FPV)",
          dateAdministered: "2024-02-15",
          nextVaccination: "2025-02-15",
          veterinarian: "Dr. Thompson"
        },
        {
          vaccine: "Feline Leukemia Virus (FeLV)",
          dateAdministered: "2024-02-15",
          nextVaccination: "2025-02-15",
          veterinarian: "Dr. Thompson"
        }
      ],
      pastObservations: [
        {
          date: "2024-02-10",
          notes: "Found in alley behind restaurant, shy but healthy",
          status: "Healthy",
        },
      ],
    },
  ]);

  const [observationAnimals, setObservationAnimals] = useState([
    {
      id: 101,
      name: "Fluffy",
      species: "Cat",
      breed: "Maine Coon",
      location: "Shopping Mall",
      dateObserved: "2024-01-10",
      observationNotes: "Appears to be pregnant, needs special care and monitoring",
      gender: "Female",
      color: "Orange and White",
      marking: "Long fur, bushy tail",
      images: {},
      vaccinations: [
        {
          vaccine: "Feline Viral Rhinotracheitis (FVR/FHV-1)",
          dateAdministered: "2024-01-15",
          nextVaccination: "2025-01-15",
          veterinarian: "Dr. Smith"
        }
      ],
      pastObservations: [
        {
          date: "2024-01-08",
          notes: "First spotted near mall entrance, appears pregnant",
          status: "Healthy",
        },
        {
          date: "2024-01-09",
          notes: "Still in same area, belly appears larger",
          status: "Healthy",
        },
      ],
    },
    {
      id: 102,
      name: "Spike",
      species: "Dog",
      breed: "Pit Bull",
      location: "Suburban Neighborhood",
      dateObserved: "2024-01-12",
      observationNotes: "Aggressive behavior, needs behavioral assessment",
      gender: "Male",
      color: "Brown",
      marking: "White chest patch",
      images: {},
      vaccinations: [
        {
          vaccine: "Canine Distemper Virus (CDV)",
          dateAdministered: "2024-01-18",
          nextVaccination: "2025-01-18",
          veterinarian: "Dr. Johnson"
        }
      ],
      pastObservations: [
        {
          date: "2024-01-11",
          notes: "Reported by residents for aggressive behavior",
          status: "Under Observation",
        },
      ],
    },
    {
      id: 103,
      name: "Snowball",
      species: "Cat",
      breed: "Domestic Longhair",
      location: "Office District",
      dateObserved: "2024-01-14",
      observationNotes: "Very friendly, seems to be someone's lost pet",
      gender: "Female",
      color: "White",
      marking: "Blue eyes, pink nose",
      images: {},
      vaccinations: [
        {
          vaccine: "Feline Calicivirus (FCV)",
          dateAdministered: "2024-01-20",
          nextVaccination: "2025-01-20",
          veterinarian: "Dr. Wilson"
        }
      ],
      pastObservations: [
        {
          date: "2024-01-13",
          notes: "Found near office buildings, very clean and friendly",
          status: "Healthy",
        },
      ],
    },
    {
      id: 104,
      name: "Thor",
      species: "Dog",
      breed: "Great Dane",
      location: "City Park",
      dateObserved: "2024-01-16",
      observationNotes: "Very large dog, appears to be well-cared for but lost",
      gender: "Male",
      color: "Fawn",
      marking: "Black mask",
      images: {},
      vaccinations: [
        {
          vaccine: "Canine Parvovirus (CPV)",
          dateAdministered: "2024-01-22",
          nextVaccination: "2025-01-22",
          veterinarian: "Dr. Brown"
        }
      ],
      pastObservations: [
        {
          date: "2024-01-15",
          notes: "Spotted in park, very gentle despite large size",
          status: "Healthy",
        },
      ],
    },
    {
      id: 105,
      name: "Princess",
      species: "Cat",
      breed: "Ragdoll",
      location: "Residential Area",
      dateObserved: "2024-01-18",
      observationNotes: "Appears to have been recently groomed, likely escaped pet",
      gender: "Female",
      color: "Seal Point",
      marking: "Blue eyes, colorpoint pattern",
      images: {},
      vaccinations: [
        {
          vaccine: "Feline Panleukopenia (FPV)",
          dateAdministered: "2024-01-25",
          nextVaccination: "2025-01-25",
          veterinarian: "Dr. Davis"
        }
      ],
      pastObservations: [
        {
          date: "2024-01-17",
          notes: "Found in residential area, very clean and well-groomed",
          status: "Healthy",
        },
      ],
    },
  ]);

  const [adoptionList, setAdoptionList] = useState([
    {
      id: 201,
      name: "Rocky",
      species: "Dog",
      breed: "German Shepherd",
      gender: "Male",
      color: "Black and Tan",
      age: "3 years",
      dateAddedToAdoption: "2023-05-25",
      status: "Available",
      notes: "Very energetic, needs active family",
    },
    {
      id: 202,
      name: "Mittens",
      species: "Cat",
      breed: "Domestic Shorthair",
      gender: "Female",
      color: "Calico",
      age: "2 years",
      dateAddedToAdoption: "2023-06-10",
      status: "Available",
      notes: "Gentle and affectionate",
    },
  ]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      status: "",
      species: "",
      observationStatus: "",
    });
    setSearchTerm("");
  };

  const handleRegisterAnimal = (formData) => {
    const commonData = {
      id:
        Math.max(
          ...capturedAnimals.map((a) => a.id),
          ...observationAnimals.map((a) => a.id),
          0
        ) + 1,
      name: formData.name,
      species: formData.type,
      breed: formData.breed,
      location: formData.locationCaptured,
      gender: formData.gender,
      color: formData.color,
      marking: formData.marking,
      images: formData.images,
      vaccinations: formData.vaccinations || [],
      pastObservations: [],
    };

    if (formData.status === "Observation") {
      const newObservationAnimal = {
        ...commonData,
        dateObserved:
          formData.dateCaptured || new Date().toISOString().split("T")[0],
        observationNotes: formData.notes || "No notes provided",
        status: "Observation",
      };
      setObservationAnimals([...observationAnimals, newObservationAnimal]);
    } else {
      const newCapturedAnimal = {
        ...commonData,
        dateCaptured:
          formData.dateCaptured || new Date().toISOString().split("T")[0],
        status: formData.status || "Healthy",
        notes: formData.notes || "",
      };
      setCapturedAnimals([...capturedAnimals, newCapturedAnimal]);
    }
    setIsRegisterModalOpen(false);
  };

  const handleRowClick = (animal) => {
    setSelectedAnimal(animal);
    setIsProfileOpen(true);
  };

  const handleSaveObservation = (updatedAnimal) => {
    setObservationAnimals(
      observationAnimals.map((animal) =>
        animal.id === updatedAnimal.id ? updatedAnimal : animal
      )
    );
  };

  const handleSaveAnimal = (updatedAnimal) => {
    if (activeTab === "captured") {
      setCapturedAnimals((prev) =>
        prev.map((animal) =>
          animal.id === updatedAnimal.id ? updatedAnimal : animal
        )
      );
    } else {
      setObservationAnimals((prev) =>
        prev.map((animal) =>
          animal.id === updatedAnimal.id ? updatedAnimal : animal
        )
      );
    }
  };

  const handleSendToObservation = (animal) => {
    const updatedAnimal = {
      ...animal,
      dateObserved: new Date().toISOString().split("T")[0],
      observationNotes: animal.notes || "No notes provided",
      status: "Observation",
    };

    setCapturedAnimals(capturedAnimals.filter((a) => a.id !== animal.id));
    setObservationAnimals([...observationAnimals, updatedAnimal]);
    setShowDropdown(null);
  };

  const handleSendToCaptured = (animal) => {
    const updatedAnimal = {
      ...animal,
      dateCaptured: new Date().toISOString().split("T")[0],
      status: "Healthy",
      notes: animal.observationNotes || "No notes provided",
    };

    setObservationAnimals(observationAnimals.filter((a) => a.id !== animal.id));
    setCapturedAnimals([...capturedAnimals, updatedAnimal]);
    setShowDropdown(null);
  };

  const handleSendToAdoption = (animal) => {
    const updatedAnimal = {
      ...animal,
      status: "Available",
      dateAddedToAdoption: new Date().toISOString().split("T")[0],
      age: "Unknown",
      notes: animal.notes || "No additional notes",
    };

    setCapturedAnimals(capturedAnimals.filter((a) => a.id !== animal.id));
    setAdoptionList([...adoptionList, updatedAnimal]);
    setShowDropdown(null);
  };

  const filteredAnimals = capturedAnimals.filter((animal) => {
    if (!animal) return false;

    const matchesSearch =
      searchTerm === "" ||
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecies =
      filters.species === "" || animal.species === filters.species;

    const matchesVaccine =
      filters.status === "" ||
      animal.vaccinations?.some(v => v.vaccine === filters.status);

    return matchesSearch && matchesSpecies && matchesVaccine;
  });

  const hasFilters =
    filters.status !== "" ||
    filters.species !== "" ||
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
        className={`transition-all duration-300 ${isDrawerOpen ? "ml-64" : "ml-0"
          }`}
      >
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Vaccination Records</h1>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#E87928] transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Record Vaccine
            </button>
          </div>

          {/* Tabs */}


          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px] max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name"
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
                {activeTab === "captured" ? (
                  <>
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
                    <div className="relative flex-1 min-w-[120px]">
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                      >
                        <option value="">All Statuses</option>
                        <option value="Canine Distemper Virus (CDV)">Canine Distemper Virus (CDV)</option>
                        <option value="Canine Adenovirus (CAV-1 and CAV-2)">Canine Adenovirus (CAV-1 and CAV-2)</option>
                        <option value="Canine Parvovirus (CPV)">Canine Parvovirus (CPV)</option>
                        <option value="Canine Parainfluenza Virus (CPiV)">Canine Parainfluenza Virus (CPiV)</option>
                        <option value="Canine Influenza Virus (CIV)">Canine Influenza Virus (CIV)</option>
                        <option value="Feline Viral Rhinotracheitis (FVR/FHV-1)">Feline Viral Rhinotracheitis (FVR/FHV-1)</option>
                        <option value="Feline Calicivirus (FCV)">Feline Calicivirus (FCV)</option>
                        <option value="Feline Panleukopenia (FPV)">Feline Panleukopenia (FPV)</option>
                        <option value="Feline Leukemia Virus (FeLV)">Feline Leukemia Virus (FeLV)</option>
                        <option value="Feline Immunodeficiency Virus (FIV)">Feline Immunodeficiency Virus (FIV)</option>
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
                  </>
                ) : (
                  <>
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

                  </>
                )}
              </div>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap ml-auto mr-100"
                >
                  <XMarkIcon className="h-6 w-6 mr-1" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Pet Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E8E8E8]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E8E8E8]">
                <thead className="bg-[#FA8630]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Species/Breed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Vaccine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Date Administered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Next Vaccination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Veterinarian
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E8E8E8]">
                  {filteredAnimals.length > 0 ? (
                    filteredAnimals.map((animal) => (
                      <tr
                        key={animal.id}
                        className="hover:bg-[#FA8630]/5 cursor-pointer"
                        onClick={() => handleRowClick(animal)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {animal.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.species} ({animal.breed})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {filters.status || animal.vaccinations?.[0]?.vaccine || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.vaccinations?.find(v => v.vaccine === filters.status)?.dateAdministered || animal.vaccinations?.[0]?.dateAdministered || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.vaccinations?.find(v => v.vaccine === filters.status)?.nextVaccination || animal.vaccinations?.[0]?.nextVaccination || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.vaccinations?.find(v => v.vaccine === filters.status)?.veterinarian || animal.vaccinations?.[0]?.veterinarian || "N/A"}
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
                                          Send to Registered Pet
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
                                            setSelectedAnimal(animal);
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
                        colSpan="8"
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

          <AddVaccine
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
        </div>
      </main>
    </div>
  );
};

export default VaccinationRecords;
